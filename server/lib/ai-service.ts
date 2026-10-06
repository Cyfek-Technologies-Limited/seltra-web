// lib/ai-service.ts

export async function generateCampaignDescription({
  productName,
  productType,
  targetAudience,
  keyFeatures,
  tone = "professional",
}: {
  productName: string;
  productType: string;
  targetAudience?: string;
  keyFeatures?: string[];
  tone?: "professional" | "casual" | "exciting" | "urgent";
}): Promise<string> {
  try {
    // For now, we'll use a simple template-based approach
    // In production, you can integrate with OpenAI, Claude, or other AI APIs

    const prompt = `Create a compelling ad description for ${productName}, which is a ${productType}. 
    ${targetAudience ? `Target audience: ${targetAudience}.` : ""}
    ${
      keyFeatures && keyFeatures.length > 0
        ? `Key features: ${keyFeatures.join(", ")}.`
        : ""
    }
    Tone: ${tone}.
    
    Requirements:
    - Maximum 600 characters
    - Include a call-to-action
    - Make it engaging and persuasive
    - Use emojis where appropriate
    - Focus on benefits, not just features`;

    // For now, return a template-based response
    // In production, replace this with actual AI API call
    return await generateWithTemplate(
      productName,
      productType,
      targetAudience,
      keyFeatures,
      tone
    );
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate campaign description");
  }
}

async function generateWithTemplate(
  productName: string,
  productType: string,
  targetAudience?: string,
  keyFeatures?: string[],
  tone: string = "professional"
): Promise<string> {
  // Simple template-based generation for now
  const templates = {
    professional: [
      `🚀 Introducing ${productName}! A premium ${productType} designed to elevate your experience. ${
        keyFeatures ? keyFeatures.slice(0, 2).join(" • ") + "." : ""
      } Perfect for ${
        targetAudience || "discriminating users"
      }. Discover the difference today! ✨`,

      `🌟 ${productName} - The ultimate ${productType} solution you've been waiting for! ${
        keyFeatures
          ? "Featuring " + keyFeatures.slice(0, 2).join(" and ") + "."
          : ""
      } Trusted by ${
        targetAudience || "thousands"
      } worldwide. Upgrade your experience now! 🎯`,

      `💫 Meet ${productName} - Revolutionizing the way you experience ${productType}. ${
        keyFeatures ? "With " + keyFeatures[0] + " and more!" : ""
      } Designed for ${
        targetAudience || "modern users"
      } who demand excellence. Join the revolution! 🔥`,
    ],
    casual: [
      `Hey! Check out ${productName} - the coolest ${productType} around! ${
        keyFeatures ? keyFeatures.slice(0, 2).join(" ⚡ ") + "!" : ""
      } Perfect for ${targetAudience || "people like you"}! 😎 Grab yours now!`,

      `OMG! You need to see ${productName}! 🎉 An amazing ${productType} that's totally game-changing. ${
        keyFeatures ? "Get " + keyFeatures[0] + " and so much more!" : ""
      } Don't miss out! 👀`,

      `Yasss! ${productName} is here! 🙌 The ${productType} everyone's talking about. ${
        keyFeatures ? keyFeatures.slice(0, 2).join(" 💫 ") + "!" : ""
      } Made for ${
        targetAudience || "awesome people"
      }. Get it while it's hot! 🔥`,
    ],
    exciting: [
      `BREAKING! 🚨 ${productName} is changing the ${productType} game FOREVER! ${
        keyFeatures
          ? "Experience " + keyFeatures.slice(0, 2).join(" & ") + "!"
          : ""
      } ${
        targetAudience
          ? "Perfect for " + targetAudience + "!"
          : "Limited time offer!"
      } Act NOW! ⚡`,

      `HOLY WOW! 🤯 ${productName} is the ${productType} revolution we needed! ${
        keyFeatures
          ? "Featuring " + keyFeatures[0] + " and mind-blowing performance!"
          : ""
      } ${
        targetAudience || "Join thousands"
      } already loving it! 🎊 Get yours TODAY!`,

      `EPIC NEWS! 🎯 ${productName} just dropped! The ${productType} that's breaking the internet. ${
        keyFeatures ? keyFeatures.slice(0, 2).join(" ✨ ") + "!" : ""
      } ${
        targetAudience ? "Designed for " + targetAudience : "Your wait is over"
      }! RUN, don't walk! 🏃‍♂️`,
    ],
    urgent: [
      `⏰ LAST CHANCE! ${productName} - the ${productType} everyone wants! ${
        keyFeatures ? "Get " + keyFeatures[0] + " before it's gone!" : ""
      } ${
        targetAudience || "Limited spots"
      } available! Don't regret missing out! 🚨`,

      `URGENT UPDATE! 🔥 ${productName} is selling out FAST! This ${productType} is a game-changer. ${
        keyFeatures ? keyFeatures[0] + " included!" : ""
      } ${
        targetAudience ? "Perfect for " + targetAudience : "Act now"
      } before it's too late! ⚡`,

      `FINAL HOURS! ⏳ ${productName} - the ${productType} solution you need. ${
        keyFeatures ? "With " + keyFeatures.slice(0, 2).join(" and ") + "." : ""
      } ${targetAudience || "Special offer"} ending soon! Secure yours NOW! 🎯`,
    ],
  };

  const selectedTemplates =
    templates[tone as keyof typeof templates] || templates.professional;
  const randomTemplate =
    selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];

  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + Math.random() * 1000)
  );

  return randomTemplate;
}
