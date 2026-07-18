const catalyst = require('zcatalyst-sdk-node');

const MODEL_NAME = 'crm-di-glm47b_30b_it';

/**
 * Call Zoho Catalyst QuickML GLM-4.7-Flash chat endpoint
 * @param {object} req - Express request object
 * @param {Array} messages - Chat messages array
 * @returns {Promise<string>} - Generated AI response string
 */
async function chatWithGLM(req, messages) {
  const projectId = process.env.CATALYST_PROJECT_ID;
  const orgId = process.env.CATALYST_ORG_ID || '6007581117';

  if (!projectId) {
    throw new Error('CATALYST_PROJECT_ID is not configured');
  }

  // Resolve QuickML token via utility (env var or Catalyst connection)
  const { resolveQuickmlToken } = require('./quickmlToken');
  let token;
  try {
    token = await resolveQuickmlToken(req);
  } catch (err) {
    // Propagate the same error message as before for consistency
    throw new Error('QuickML authorization token not resolved (no connection or QUICKML_ACCESS_TOKEN env)');
  }

  const url = `https://api.catalyst.zoho.in/quickml/v1/project/${projectId}/glm/chat`;

  // Format messages context
  const glmMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
    content: m.content
  }));

  // Abort the request if it takes longer than 300 seconds (5 minutes)
  let controller = new AbortController();
  let timeout = setTimeout(() => controller.abort(), 300_000);

  let response;
  // Attempt the request, retry up to 2 additional times (total 3 attempts)
  let attempt = 0;
  const maxAttempts = 3;
  try {
    while (attempt < maxAttempts) {
      attempt++;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'CATALYST-ORG': orgId
          },
          body: JSON.stringify({
            model: MODEL_NAME,
            messages: glmMessages,
            max_tokens: 2000,
            temperature: 0.7,
            chat_template_kwargs: {
              enable_thinking: false
            }
          }),
          signal: controller.signal
        });
        break; // success
      } catch (err) {
        if (err.name === 'AbortError' && attempt < maxAttempts) {
          // Reset the controller and timeout for the retry
          controller = new AbortController();
          clearTimeout(timeout);
          timeout = setTimeout(() => controller.abort(), 300_000);
        } else {
          // If the fetch was aborted due to timeout, throw a clearer error
          if (err.name === 'AbortError') {
            throw new Error('QuickML request timed out after 300 seconds');
          }
          throw err;
        }
      }
    }
  } finally {
    clearTimeout(timeout);
  }

  if (!response) {
    throw new Error('QuickML request failed: no response received after all retry attempts');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`QuickML endpoint returned status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  
  function cleanReasoning(content) {
    if (typeof content !== 'string') return content;
    let clean = content;
    // Strip everything between <think> and </think> tags
    clean = clean.replace(/<think>[\s\S]*?<\/think>/g, '');
    // If there is an unclosed <think> tag, strip everything from <think> to the end of the text
    if (clean.includes('<think>')) {
      clean = clean.split('<think>')[0];
    }
    // Fallback if model uses </think> but no <think> (or mismatch)
    if (clean.includes('</think>')) {
      clean = clean.split('</think>').pop();
    }
    return clean.trim();
  }
  
  if (result.response) {
    return cleanReasoning(result.response);
  }
  if (result.choices && result.choices[0] && result.choices[0].message) {
    return cleanReasoning(result.choices[0].message.content);
  }
  if (result.reply) {
    return cleanReasoning(result.reply);
  }
  if (result.output || result.content) {
    return cleanReasoning(result.output || result.content);
  }
  const fallbackStr = typeof result === 'string' ? result : JSON.stringify(result);
  return cleanReasoning(fallbackStr);
}

module.exports = {
  chatWithGLM
};
