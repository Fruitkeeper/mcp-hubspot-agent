
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const News = () => {
  const newsArticles = [
    {
      id: 1,
      title: 'HubSpot Launches New AI-Powered Lead Scoring Features',
      summary: 'HubSpot introduces machine learning algorithms to automatically score and prioritize leads based on behavioral patterns and conversion probability.',
      category: 'Product Update',
      source: 'HubSpot Blog',
      timeAgo: '2 hours ago',
      readTime: '3 min read',
      featured: true
    },
    {
      id: 2,
      title: 'Salesforce Reports 23% Increase in CRM Adoption Among SMBs',
      summary: 'Small and medium businesses are rapidly adopting CRM solutions, with Salesforce leading the charge in the SMB market segment.',
      category: 'Industry News',
      source: 'TechCrunch',
      timeAgo: '4 hours ago',
      readTime: '5 min read',
      featured: false
    },
    {
      id: 3,
      title: 'The Rise of Revenue Operations: How GTM Teams Are Evolving',
      summary: 'Revenue Operations is becoming a critical function for GTM teams, bridging the gap between sales, marketing, and customer success.',
      category: 'Trend Analysis',
      source: 'GTM Insights',
      timeAgo: '6 hours ago',
      readTime: '7 min read',
      featured: true
    },
    {
      id: 4,
      title: 'New Study: 67% of Sales Teams Using Multiple CRM Platforms',
      summary: 'Research shows most sales organizations are using 2-3 different CRM tools, highlighting the need for unified solutions.',
      category: 'Research',
      source: 'Sales Hacker',
      timeAgo: '8 hours ago',
      readTime: '4 min read',
      featured: false
    },
    {
      id: 5,
      title: 'Pipedrive Introduces Advanced Pipeline Analytics Dashboard',
      summary: 'New analytics features provide deeper insights into sales pipeline health and conversion bottlenecks.',
      category: 'Product Update',
      source: 'Pipedrive',
      timeAgo: '12 hours ago',
      readTime: '2 min read',
      featured: false
    },
    {
      id: 6,
      title: 'Best Practices for CRM Data Migration in 2024',
      summary: 'Essential strategies and tools for safely migrating CRM data between platforms without losing critical information.',
      category: 'How-To',
      source: 'CRM Weekly',
      timeAgo: '1 day ago',
      readTime: '6 min read',
      featured: false
    }
  ];

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Product Update': 'bg-blue-100 text-blue-700',
      'Industry News': 'bg-green-100 text-green-700',
      'Trend Analysis': 'bg-purple-100 text-purple-700',
      'Research': 'bg-orange-100 text-orange-700',
      'How-To': 'bg-pink-100 text-pink-700'
    };
    return colorMap[category] || 'bg-slate-100 text-slate-700';
  };

  const featuredArticles = newsArticles.filter(article => article.featured);
  const regularArticles = newsArticles.filter(article => !article.featured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">GTM News & Updates</h2>
          <p className="text-slate-600">Stay updated with the latest in CRM and GTM tools</p>
        </div>
        
        <Button variant="outline">
          Subscribe to Updates
        </Button>
      </div>

      {/* Featured Articles */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Featured Stories</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredArticles.map((article) => (
            <Card key={article.id} className="p-6 border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <Badge className={getCategoryColor(article.category)}>
                  {article.category}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Featured
                </Badge>
              </div>
              
              <h4 className="font-semibold text-slate-800 mb-2 leading-tight">
                {article.title}
              </h4>
              
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-3">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{article.timeAgo}</span>
                </div>
                <span>{article.readTime}</span>
              </div>
              
              <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto text-blue-600 hover:text-blue-700">
                Read more →
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Regular Articles */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Latest News</h3>
        <div className="space-y-4">
          {regularArticles.map((article) => (
            <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getCategoryColor(article.category)} variant="secondary">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-slate-500">{article.timeAgo}</span>
                  </div>
                  
                  <h4 className="font-medium text-slate-800 mb-1 hover:text-blue-600 cursor-pointer">
                    {article.title}
                  </h4>
                  
                  <p className="text-sm text-slate-600 mb-2">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{article.source}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  Read
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="text-center pt-6">
        <Button variant="outline" size="lg">
          Load More Articles
        </Button>
      </div>
    </div>
  );
};

export default News;
