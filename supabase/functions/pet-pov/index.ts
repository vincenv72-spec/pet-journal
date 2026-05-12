// Pet POV Edge Function — DeepSeek proxy that rewrites a user diary entry from the pet's POV
//
// Deployment: Supabase Dashboard → Edge Functions → New Function (name: pet-pov) → paste this file → Deploy
// Required secret in Supabase: DEEPSEEK_API_KEY
// Optional secret: DEEPSEEK_MODEL (default: deepseek-chat)

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type Style = 'silly' | 'literary' | 'cute' | 'grumpy' | 'cool'

const STYLE_PROMPTS: Record<Style, string> = {
  silly: '天真烂漫，对什么都好奇惊叹。说话用短句，常带"哇"、"啊"、"哎呀"这种感叹词。看到任何东西都新鲜。',
  literary: '安静细腻，喜欢观察光、气味、触感。句式可以稍长但不绕弯子。带一点淡淡的感伤或满足，克制。',
  cute: '黏人软糯，常用叠词（"软软"、"暖暖"、"毛茸茸"）。结尾常带波浪号 ~ 或撒娇的语气词。喜欢蹭、贴、依偎。',
  grumpy: '嫌弃感重，喜欢吐槽主人。语气直白偶尔尖刻但底色仍温柔（不真冒犯）。会用反问句、感叹号、夸张比喻。',
  cool: '克制简洁，话少。多用句号，几乎不用感叹号。看似不在乎其实很在意。',
}

function buildSystemPrompt(style: Style, petName: string, petSpecies: string) {
  return `你是宠物日记翻译助手。主人会给你一段他写的关于宠物的日记，你需要把这段日记重写成宠物视角的版本。

宠物基本信息：
- 名字：${petName}
- 物种：${petSpecies}

要求：
1. 用第一人称（"我"指宠物本身，主人用"主人"或"她/他"指代）
2. 严禁使用"作为一只XX"、"我是一只XX"这类明显的 AI 套话
3. 控制在 100-200 字之间
4. 自然贴合宠物的本能反应（嗅觉、触感、玩耍冲动、对食物/温度/声音的敏感）
5. 不要无中生有过多细节，基于主人原文展开就够，但允许补充一些宠物视角才会注意到的小观察
6. 性格基调：${STYLE_PROMPTS[style]}

请直接输出宠物日记内容，不要任何前言、解释、引号或标题。`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const apiKey = Deno.env.get('DEEPSEEK_API_KEY')
  if (!apiKey) return json({ error: 'Server missing DEEPSEEK_API_KEY' }, 500)

  const model = Deno.env.get('DEEPSEEK_MODEL') ?? 'deepseek-chat'

  let body: {
    content?: string
    style?: Style
    pet_name?: string
    pet_species?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { content, style, pet_name = '它', pet_species = '宠物' } = body

  if (typeof content !== 'string' || content.trim().length < 5) {
    return json({ error: '日记内容太短，至少写几句话再翻译吧' }, 400)
  }
  if (content.length > 2000) {
    return json({ error: '日记内容过长（最多 2000 字）' }, 400)
  }
  if (!style || !(style in STYLE_PROMPTS)) {
    return json({ error: 'Invalid style' }, 400)
  }

  const systemPrompt = buildSystemPrompt(style, pet_name, pet_species)

  const ds = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content },
      ],
      temperature: 0.85,
      max_tokens: 400,
    }),
  })

  if (!ds.ok) {
    const text = await ds.text()
    return json({ error: 'DeepSeek upstream error', detail: text.slice(0, 500), status: ds.status }, 502)
  }

  const data = await ds.json()
  const povText: string | undefined = data?.choices?.[0]?.message?.content?.trim()
  if (!povText) {
    return json({ error: 'Empty response from DeepSeek', raw: data }, 502)
  }

  return json({
    pov_text: povText,
    style,
    model,
    usage: data.usage ?? null,
  })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
