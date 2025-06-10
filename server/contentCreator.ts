import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ContentRequest {
  type: 'social' | 'email';
  platform?: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  industry?: string;
  audience?: string;
  topic?: string;
  tone?: 'professional' | 'casual' | 'engaging' | 'informative';
}

interface GeneratedContent {
  subject?: string;
  content: string;
  hashtags?: string[];
  callToAction?: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    estimatedReadTime: number;
  };
}

export async function generateContent(request: ContentRequest): Promise<GeneratedContent> {
  const { type, platform, industry, audience, topic, tone = 'professional' } = request;

  let prompt = '';
  let maxTokens = 500;

  if (type === 'social') {
    const platformLimits = {
      twitter: 280,
      linkedin: 3000,
      facebook: 2000,
      instagram: 2200
    };

    const charLimit = platform ? platformLimits[platform] : 280;
    maxTokens = Math.min(charLimit / 4, 300); // Rough token estimation

    prompt = `Create engaging ${platform || 'social media'} content for ${industry || 'business'} targeting ${audience || 'professionals'}.

Topic: ${topic || 'industry insights and tips'}
Tone: ${tone}
Character limit: ${charLimit}

Requirements:
- Include relevant hashtags
- Add a clear call-to-action
- Make it engaging and shareable
- Stay within character limits
- Use industry-appropriate language

Respond with JSON: {
  "content": "main post content",
  "hashtags": ["hashtag1", "hashtag2"],
  "callToAction": "specific CTA text"
}`;
  } else {
    prompt = `Create professional email content for ${industry || 'business'} targeting ${audience || 'clients'}.

Topic: ${topic || 'business updates and insights'}
Tone: ${tone}

Requirements:
- Compelling subject line
- Clear, valuable content
- Professional formatting
- Strong call-to-action
- Appropriate length for email

Respond with JSON: {
  "subject": "email subject line",
  "content": "email body content",
  "callToAction": "specific CTA text"
}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert content creator specializing in business communications. Create engaging, professional content that drives results."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: maxTokens,
      temperature: 0.7
    });

    const generatedData = JSON.parse(response.choices[0].message.content || '{}');
    
    const content = generatedData.content || '';
    const wordCount = content.split(' ').length;
    const characterCount = content.length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // Average reading speed

    return {
      subject: generatedData.subject,
      content: generatedData.content,
      hashtags: generatedData.hashtags || [],
      callToAction: generatedData.callToAction,
      metadata: {
        wordCount,
        characterCount,
        estimatedReadTime
      }
    };
  } catch (error) {
    console.error('Content generation error:', error);
    throw new Error('Failed to generate content: ' + error.message);
  }
}

export async function generateSocialMediaPost(
  platform: string,
  industry: string,
  topic?: string
): Promise<GeneratedContent> {
  return generateContent({
    type: 'social',
    platform: platform as any,
    industry,
    topic,
    tone: 'engaging'
  });
}

export async function generateEmailCampaign(
  audience: string,
  industry: string,
  topic?: string
): Promise<GeneratedContent> {
  return generateContent({
    type: 'email',
    audience,
    industry,
    topic,
    tone: 'professional'
  });
}

// Simulate social media posting (placeholder for actual API integrations)
export async function postToSocialMedia(
  platform: string,
  content: string,
  hashtags: string[]
): Promise<{ success: boolean; platform: string; postId?: string; error?: string }> {
  try {
    // In a real implementation, this would connect to actual social media APIs
    // For now, we'll simulate the posting process
    console.log(`📱 Posting to ${platform}:`, content);
    console.log(`🏷️ Hashtags:`, hashtags);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure randomly for demo
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        success: true,
        platform,
        postId: `${platform}_${Date.now()}`
      };
    } else {
      return {
        success: false,
        platform,
        error: `Failed to post to ${platform} - API error`
      };
    }
  } catch (error) {
    return {
      success: false,
      platform,
      error: error.message
    };
  }
}

// Simulate email campaign sending (placeholder for actual email service)
export async function sendEmailCampaign(
  subject: string,
  content: string,
  audience: string
): Promise<{ success: boolean; campaignId?: string; recipientCount?: number; error?: string }> {
  try {
    console.log(`📧 Sending email campaign:`, subject);
    console.log(`👥 Audience:`, audience);
    console.log(`📝 Content preview:`, content.substring(0, 100) + '...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success
    const recipientCount = Math.floor(Math.random() * 500) + 100; // 100-600 recipients
    
    return {
      success: true,
      campaignId: `email_${Date.now()}`,
      recipientCount
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}