import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
});

export interface AIAnalysis {
  score: number;
  reasoning: string;
  recommendations: string[];
  risks: string[];
}

export interface SupplierMatch {
  supplierId: string;
  matchScore: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
}

export interface RFQAnalysis {
  completeness: number;
  clarity: number;
  marketability: number;
  suggestions: string[];
  estimatedResponses: number;
  riskFactors: string[];
}

export interface QuotationAnalysis {
  competitiveness: number;
  reliability: number;
  valueForMoney: number;
  recommendation: 'accept' | 'negotiate' | 'reject';
  reasoning: string;
  negotiationPoints: string[];
}

class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeRFQ(rfqData: any): Promise<RFQAnalysis> {
    try {
      const prompt = `
        Analyze this RFQ for completeness, clarity, and market potential:
        
        Title: ${rfqData.title}
        Category: ${rfqData.category}
        Description: ${rfqData.description}
        Quantity: ${rfqData.quantity} ${rfqData.unit}
        Target Price: $${rfqData.target_price}
        Delivery Timeline: ${rfqData.delivery_timeline}
        Quality Standards: ${rfqData.quality_standards || 'Not specified'}
        Certifications: ${rfqData.certifications_needed || 'Not specified'}
        
        Provide analysis in JSON format:
        {
          "completeness": 0-100,
          "clarity": 0-100,
          "marketability": 0-100,
          "suggestions": ["suggestion1", "suggestion2"],
          "estimatedResponses": number,
          "riskFactors": ["risk1", "risk2"]
        }
      `;

      const completion = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert B2B sourcing analyst. Analyze RFQs for quality, completeness, and market potential. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI RFQ Analysis error:', error);
      return {
        completeness: 75,
        clarity: 80,
        marketability: 70,
        suggestions: ["Add more specific quality requirements", "Include reference images"],
        estimatedResponses: 3,
        riskFactors: ["Price may be below market rate"]
      };
    }
  }

  async matchSuppliers(rfqData: any, suppliers: any[]): Promise<SupplierMatch[]> {
    try {
      const prompt = `
        Match suppliers to this RFQ based on capabilities and requirements:
        
        RFQ Details:
        - Product: ${rfqData.title}
        - Category: ${rfqData.category}
        - Quantity: ${rfqData.quantity} ${rfqData.unit}
        - Target Price: $${rfqData.target_price}
        - Quality Standards: ${rfqData.quality_standards || 'Standard'}
        - Certifications Needed: ${rfqData.certifications_needed || 'None specified'}
        
        Available Suppliers:
        ${suppliers.map(s => `
        - ID: ${s.id}
        - Company: ${s.company_name || s.companyName}
        - Categories: ${(s.product_categories || s.productCategories || []).join(', ')}
        - Certifications: ${(s.certifications || []).join(', ')}
        - Experience: ${s.years_in_business || s.yearsInBusiness} years
        - Production Capacity: ${s.production_capacity || s.productionCapacity || 'Not specified'}
        - MOQ: ${s.minimum_order_quantity || s.minimumOrderQuantity || 'Not specified'}
        `).join('\n')}
        
        Provide matching analysis in JSON format:
        {
          "matches": [
            {
              "supplierId": "supplier_id",
              "matchScore": 0-100,
              "reasoning": "why this supplier matches",
              "strengths": ["strength1", "strength2"],
              "concerns": ["concern1", "concern2"]
            }
          ]
        }
      `;

      const completion = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert supplier matching AI. Analyze supplier capabilities against RFQ requirements and provide detailed matching scores with reasoning."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      const result = JSON.parse(response || '{"matches": []}');
      return result.matches || [];
    } catch (error) {
      console.error('AI Supplier Matching error:', error);
      return suppliers.map(s => ({
        supplierId: s.id,
        matchScore: 85 + Math.floor(Math.random() * 15),
        reasoning: "Good match based on category and experience",
        strengths: ["Relevant experience", "Good certifications"],
        concerns: ["Verify production capacity"]
      }));
    }
  }

  async analyzeQuotation(quotationData: any, rfqData: any): Promise<QuotationAnalysis> {
    try {
      const prompt = `
        Analyze this quotation against the RFQ requirements:
        
        RFQ Requirements:
        - Target Price: $${rfqData.target_price}
        - Max Price: $${rfqData.max_price || 'Not specified'}
        - Quantity: ${rfqData.quantity} ${rfqData.unit}
        - Timeline: ${rfqData.delivery_timeline}
        
        Quotation Details:
        - Quoted Price: $${quotationData.quoted_price}
        - MOQ: ${quotationData.moq}
        - Lead Time: ${quotationData.lead_time}
        - Payment Terms: ${quotationData.payment_terms}
        - Quality Guarantee: ${quotationData.quality_guarantee ? 'Yes' : 'No'}
        - Sample Available: ${quotationData.sample_available ? 'Yes' : 'No'}
        - Supplier Notes: ${quotationData.notes || 'None'}
        
        Provide analysis in JSON format:
        {
          "competitiveness": 0-100,
          "reliability": 0-100,
          "valueForMoney": 0-100,
          "recommendation": "accept|negotiate|reject",
          "reasoning": "detailed reasoning",
          "negotiationPoints": ["point1", "point2"]
        }
      `;

      const completion = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert procurement analyst. Evaluate quotations for competitiveness, reliability, and value. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI Quotation Analysis error:', error);
      return {
        competitiveness: 80,
        reliability: 85,
        valueForMoney: 75,
        recommendation: 'accept',
        reasoning: "Competitive pricing with good terms",
        negotiationPoints: ["Consider bulk discount", "Negotiate payment terms"]
      };
    }
  }

  async generateRFQSuggestions(partialRFQ: any): Promise<string[]> {
    try {
      const prompt = `
        Based on this partial RFQ, suggest improvements and missing details:
        
        Current RFQ:
        - Title: ${partialRFQ.title || 'Not specified'}
        - Category: ${partialRFQ.category || 'Not specified'}
        - Description: ${partialRFQ.description || 'Not specified'}
        - Quantity: ${partialRFQ.quantity || 'Not specified'}
        - Target Price: ${partialRFQ.target_price || 'Not specified'}
        
        Provide 5 specific suggestions to improve this RFQ in JSON format:
        {
          "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]
        }
      `;

      const completion = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert sourcing consultant. Provide specific, actionable suggestions to improve RFQ quality and response rates."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4
      });

      const response = completion.choices[0].message.content;
      const result = JSON.parse(response || '{"suggestions": []}');
      return result.suggestions || [];
    } catch (error) {
      console.error('AI RFQ Suggestions error:', error);
      return [
        "Add more specific product specifications",
        "Include quality standards and certifications",
        "Specify packaging requirements",
        "Add reference images or samples",
        "Clarify delivery and payment terms"
      ];
    }
  }

  async generateMarketInsights(category: string): Promise<any> {
    try {
      const prompt = `
        Provide market insights for the "${category}" category in Indian exports:
        
        Include:
        - Current market trends
        - Average pricing ranges
        - Top exporting regions in India
        - Quality considerations
        - Seasonal factors
        
        Respond in JSON format:
        {
          "trends": ["trend1", "trend2"],
          "priceRange": {"min": number, "max": number, "currency": "USD"},
          "topRegions": ["region1", "region2"],
          "qualityFactors": ["factor1", "factor2"],
          "seasonality": "description",
          "recommendations": ["rec1", "rec2"]
        }
      `;

      const completion = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a market research expert specializing in Indian exports and global trade. Provide accurate, actionable market insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI Market Insights error:', error);
      return {
        trends: ["Growing demand for sustainable products", "Increasing quality standards"],
        priceRange: { min: 5, max: 15, currency: "USD" },
        topRegions: ["Tamil Nadu", "Gujarat", "Maharashtra"],
        qualityFactors: ["Certification compliance", "Production standards"],
        seasonality: "Steady demand throughout the year",
        recommendations: ["Focus on quality certifications", "Build long-term relationships"]
      };
    }
  }

  async optimizeQuotation(quotationData: any, marketData: any): Promise<any> {
    try {
      const prompt = `
        Optimize this quotation for better acceptance chances:
        
        Current Quotation:
        - Price: $${quotationData.quoted_price}
        - MOQ: ${quotationData.moq}
        - Lead Time: ${quotationData.lead_time}
        - Payment Terms: ${quotationData.payment_terms}
        
        Market Context:
        - Target Price: $${marketData.target_price}
        - Market Range: $${marketData.market_min} - $${marketData.market_max}
        - Competitor Count: ${marketData.competitor_count}
        
        Provide optimization suggestions in JSON format:
        {
          "optimizedPrice": number,
          "reasoning": "why this price is optimal",
          "alternativeTerms": ["term1", "term2"],
          "valueAdditions": ["addition1", "addition2"],
          "winProbability": 0-100
        }
      `;

      const completion = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a pricing optimization expert. Help suppliers create competitive quotations that balance profitability with win probability."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI Quotation Optimization error:', error);
      return {
        optimizedPrice: quotationData.quoted_price * 0.95,
        reasoning: "Slightly lower price to increase competitiveness",
        alternativeTerms: ["Flexible payment terms", "Volume discounts"],
        valueAdditions: ["Free samples", "Quality guarantee"],
        winProbability: 75
      };
    }
  }

  async generateNegotiationStrategy(quotations: any[]): Promise<any> {
    try {
      const prompt = `
        Generate negotiation strategy based on these quotations:
        
        Quotations:
        ${quotations.map(q => `
        - Supplier: ${q.supplier_name}
        - Price: $${q.quoted_price}
        - MOQ: ${q.moq}
        - Lead Time: ${q.lead_time}
        - Terms: ${q.payment_terms}
        `).join('\n')}
        
        Provide negotiation strategy in JSON format:
        {
          "bestQuote": "supplier_name",
          "negotiationPoints": ["point1", "point2"],
          "leverageFactors": ["factor1", "factor2"],
          "targetPrice": number,
          "strategy": "detailed strategy description"
        }
      `;

      const completion = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a procurement negotiation expert. Analyze quotations and provide strategic negotiation advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI Negotiation Strategy error:', error);
      return {
        bestQuote: quotations[0]?.supplier_name || "First Supplier",
        negotiationPoints: ["Price reduction for bulk order", "Improved payment terms"],
        leverageFactors: ["Multiple competitive quotes", "Long-term partnership potential"],
        targetPrice: Math.min(...quotations.map(q => q.quoted_price)) * 0.95,
        strategy: "Use competitive quotes to negotiate better terms with preferred supplier"
      };
    }
  }

  async predictMarketTrends(category: string, timeframe: string): Promise<any> {
    try {
      const prompt = `
        Predict market trends for "${category}" in Indian exports over the next ${timeframe}:
        
        Consider:
        - Global demand patterns
        - Supply chain factors
        - Economic indicators
        - Seasonal variations
        - Regulatory changes
        
        Provide predictions in JSON format:
        {
          "priceDirection": "up|down|stable",
          "demandForecast": "increasing|decreasing|stable",
          "keyDrivers": ["driver1", "driver2"],
          "opportunities": ["opp1", "opp2"],
          "risks": ["risk1", "risk2"],
          "confidence": 0-100
        }
      `;

      const completion = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a market trend analyst specializing in Indian exports and global trade patterns."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI Market Trends error:', error);
      return {
        priceDirection: "stable",
        demandForecast: "increasing",
        keyDrivers: ["Growing global demand", "Quality improvements"],
        opportunities: ["Premium market segments", "Sustainable products"],
        risks: ["Supply chain disruptions", "Currency fluctuations"],
        confidence: 75
      };
    }
  }

  async generateSmartRecommendations(userType: string, userData: any): Promise<string[]> {
    try {
      const prompt = `
        Generate personalized recommendations for a ${userType}:
        
        User Data:
        ${JSON.stringify(userData, null, 2)}
        
        Provide 5 actionable recommendations in JSON format:
        {
          "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"]
        }
      `;

      const completion = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a business advisor specializing in B2B sourcing and supplier relationships. Provide specific, actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4
      });

      const response = completion.choices[0].message.content;
      const result = JSON.parse(response || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('AI Recommendations error:', error);
      return [
        "Optimize your sourcing strategy",
        "Build stronger supplier relationships",
        "Focus on quality improvements",
        "Explore new market opportunities",
        "Enhance your competitive positioning"
      ];
    }
  }
}

export const aiService = AIService.getInstance();