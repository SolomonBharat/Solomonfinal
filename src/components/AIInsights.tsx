import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Lightbulb, AlertTriangle, Star, Zap } from 'lucide-react';
import { aiService } from '../lib/aiService';

interface AIInsightsProps {
  type: 'rfq' | 'quotation' | 'market' | 'supplier';
  data: any;
  onInsightUpdate?: (insights: any) => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ type, data, onInsightUpdate }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [data, type]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      let result;
      
      switch (type) {
        case 'rfq':
          result = await aiService.analyzeRFQ(data);
          break;
        case 'quotation':
          result = await aiService.analyzeQuotation(data.quotation, data.rfq);
          break;
        case 'market':
          result = await aiService.generateMarketInsights(data.category);
          break;
        case 'supplier':
          result = await aiService.matchSuppliers(data.rfq, data.suppliers);
          break;
        default:
          result = null;
      }
      
      setInsights(result);
      if (onInsightUpdate) {
        onInsightUpdate(result);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">🤖 AI Analysis in Progress</h3>
            <p className="text-blue-700">Generating intelligent insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">🤖 AI Insights</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
          Powered by AI
        </span>
      </div>

      {/* RFQ Analysis */}
      {type === 'rfq' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Completeness</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${insights.completeness}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-blue-900">{insights.completeness}%</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Clarity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${insights.clarity}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-green-900">{insights.clarity}%</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Market Appeal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${insights.marketability}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-purple-900">{insights.marketability}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📈 Expected Response Rate</h4>
            <p className="text-2xl font-bold text-blue-800">{insights.estimatedResponses} quotations</p>
            <p className="text-sm text-blue-600">Based on market analysis and RFQ quality</p>
          </div>

          {insights.suggestions && insights.suggestions.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-1" />
                💡 AI Suggestions
              </h4>
              <ul className="space-y-1">
                {insights.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.riskFactors && insights.riskFactors.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                ⚠️ Risk Factors
              </h4>
              <ul className="space-y-1">
                {insights.riskFactors.map((risk: string, index: number) => (
                  <li key={index} className="text-sm text-red-800 flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quotation Analysis */}
      {type === 'quotation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Competitiveness</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${insights.competitiveness}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-green-900">{insights.competitiveness}%</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Reliability</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${insights.reliability}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-blue-900">{insights.reliability}%</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Value</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${insights.valueForMoney}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-purple-900">{insights.valueForMoney}%</span>
              </div>
            </div>
          </div>

          <div className={`bg-white p-4 rounded-lg border-2 ${
            insights.recommendation === 'accept' ? 'border-green-300 bg-green-50' :
            insights.recommendation === 'negotiate' ? 'border-yellow-300 bg-yellow-50' :
            'border-red-300 bg-red-50'
          }`}>
            <h4 className={`font-semibold mb-2 flex items-center ${
              insights.recommendation === 'accept' ? 'text-green-900' :
              insights.recommendation === 'negotiate' ? 'text-yellow-900' :
              'text-red-900'
            }`}>
              <Zap className="h-4 w-4 mr-1" />
              🎯 AI Recommendation: {insights.recommendation.toUpperCase()}
            </h4>
            <p className={`text-sm ${
              insights.recommendation === 'accept' ? 'text-green-800' :
              insights.recommendation === 'negotiate' ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              {insights.reasoning}
            </p>
          </div>

          {insights.negotiationPoints && insights.negotiationPoints.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">🤝 Negotiation Points</h4>
              <ul className="space-y-1">
                {insights.negotiationPoints.map((point: string, index: number) => (
                  <li key={index} className="text-sm text-orange-800 flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Market Insights */}
      {type === 'market' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">📈 Price Trend</h4>
              <p className="text-lg font-bold text-green-800 capitalize">{insights.priceDirection}</p>
              {insights.priceRange && (
                <p className="text-sm text-green-600">
                  Range: ${insights.priceRange.min} - ${insights.priceRange.max}
                </p>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Demand Forecast</h4>
              <p className="text-lg font-bold text-blue-800 capitalize">{insights.demandForecast}</p>
              <p className="text-sm text-blue-600">Next 6 months</p>
            </div>
          </div>

          {insights.trends && (
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">🔮 Market Trends</h4>
              <ul className="space-y-1">
                {insights.trends.map((trend: string, index: number) => (
                  <li key={index} className="text-sm text-purple-800 flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.recommendations && (
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">💡 AI Recommendations</h4>
              <ul className="space-y-1">
                {insights.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Supplier Matching */}
      {type === 'supplier' && insights.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-blue-900">🎯 AI Supplier Matching Results</h4>
          {insights.slice(0, 3).map((match: any, index: number) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-gray-900">Supplier {index + 1}</h5>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  {match.matchScore}% Match
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{match.reasoning}</p>
              
              {match.strengths && match.strengths.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-green-700">Strengths:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {match.strengths.map((strength: string, i: number) => (
                      <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {match.concerns && match.concerns.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-orange-700">Considerations:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {match.concerns.map((concern: string, i: number) => (
                      <span key={i} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsights;