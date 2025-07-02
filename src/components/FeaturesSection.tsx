
import { Calendar, Heart, Mail, User, Settings, Bell, MapPin, Coffee, Star } from 'lucide-react';

const FeaturesSection = () => {
  const steps = [
    {
      number: "01",
      icon: <User className="h-8 w-8 text-rose-500" />,
      title: "Tell us about your relationships",
      description: "Share your location, interests, and preferences so we can craft perfect activity ideas for your friends, family, and loved ones.",
      gradient: "from-rose-100 to-rose-50"
    },
    {
      number: "02", 
      icon: <Settings className="h-8 w-8 text-rose-500" />,
      title: "Set your nudge preferences",
      description: "Choose how often you want activity ideas (weekly, bi-weekly, or monthly) and what types of experiences you enjoy.",
      gradient: "from-cream-100 to-cream-50"
    },
    {
      number: "03",
      icon: <Bell className="h-8 w-8 text-rose-500" />,
      title: "Receive personalized activity ideas",  
      description: "Get 3 curated suggestions delivered to your inbox, complete with locations, timing, and budget estimates for any relationship.",
      gradient: "from-sage-100 to-sage-50"
    }
  ];

  const features = [
    {
      icon: <Heart className="h-8 w-8 text-rose-500 fill-rose-200" />,
      title: "Personalized Activity Ideas",
      description: "Get 3 custom suggestions every week based on your city, interests, and budget. From romantic dinners to family outings to friend adventures - we've got your next perfect activity planned.",
      gradient: "from-rose-100 to-rose-50",
      examples: ["Romantic sunset spots for couples", "Fun family activities for rainy days", "Unique friend hangout ideas", "Birthday celebration suggestions"]
    },
    {
      icon: <MapPin className="h-8 w-8 text-rose-500" />,
      title: "Local & Seasonal Suggestions",
      description: "Discover hidden gems in your city with activity ideas that match the season and weather. We research the best local spots for any type of relationship.",
      gradient: "from-cream-100 to-cream-50", 
      examples: ["Seasonal farmers markets", "New restaurant openings", "Local events and festivals", "Weather-appropriate activities"]
    },
    {
      icon: <Calendar className="h-8 w-8 text-rose-500" />,
      title: "Smart Timing & Reminders",
      description: "Never miss important dates again. Get gentle reminders for birthdays, anniversaries, and perfect moments to plan something special with anyone in your circle.",
      gradient: "from-sage-100 to-sage-50",
      examples: ["Birthday surprise planning", "Anniversary countdowns", "Friend hangout reminders", "Family gathering alerts"]
    }
  ];

  const sampleIdeas = [
    {
      title: "Cozy Friend Hangout",
      description: "Visit the new indie bookstore on Main St, grab hot chocolate, and browse books together",
      budget: "$15-25",
      time: "2-3 hours"
    },
    {
      title: "Family Adventure", 
      description: "Hike the Sunset Trail, pack a picnic lunch, and enjoy nature with the whole family",
      budget: "$10-20",
      time: "4-5 hours"
    },
    {
      title: "Romantic Date Night",
      description: "Take a pottery class at City Arts Center, then dinner at that Italian place you bookmarked",
      budget: "$80-120", 
      time: "3-4 hours"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-rose-800 mb-6">
            From boring routines to
            <span className="text-gradient block">meaningful moments</span>
          </h2>
          <p className="text-xl text-rose-700/80 max-w-2xl mx-auto">
            Stop scrolling through the same old activity ideas. Get personalized suggestions 
            that actually fit your relationships, budget, and city.
          </p>
        </div>

        {/* Sample Activity Ideas Preview */}
        <div id="preview" className="mb-20">
          <h3 className="text-3xl font-playfair font-bold text-rose-800 text-center mb-8">
            What your personalized nudges look like
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {sampleIdeas.map((idea, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-rose-50 to-cream-50 p-6 rounded-3xl shadow-lg border-2 border-rose-100 animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-playfair font-semibold text-rose-800">
                    {idea.title}
                  </h4>
                  <Star className="h-5 w-5 text-rose-400 flex-shrink-0" />
                </div>
                <p className="text-rose-700/80 mb-4 leading-relaxed">
                  {idea.description}
                </p>
                <div className="flex justify-between text-sm text-rose-600/70">
                  <span>💰 {idea.budget}</span>
                  <span>⏱️ {idea.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-rose-600/70 text-lg">
              📧 Delivered to your inbox every week with 3 fresh ideas
            </p>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="mb-20">
          <h3 className="text-3xl font-playfair font-bold text-rose-800 text-center mb-12">
            How it works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="group animate-fade-in relative"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`bg-gradient-to-br ${step.gradient} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full`}>
                  {/* Step Number */}
                  <div className="text-6xl font-playfair font-bold text-rose-300/40 absolute top-4 right-6">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="text-xl font-playfair font-semibold text-rose-800 mb-4">
                    {step.title}
                  </h4>
                  <p className="text-rose-700/80 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h3 className="text-3xl font-playfair font-bold text-rose-800 text-center mb-12">
            Why people love Careloom
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 200 + 600}ms` }}
              >
                <div className={`bg-gradient-to-br ${feature.gradient} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full`}>
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="text-xl font-playfair font-semibold text-rose-800 mb-4">
                    {feature.title}
                  </h4>
                  <p className="text-rose-700/80 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Examples */}
                  <div className="space-y-2">
                    {feature.examples.map((example, idx) => (
                      <div key={idx} className="flex items-center text-sm text-rose-600/70">
                        <Coffee className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="bg-gradient-to-r from-rose-50 to-cream-50 rounded-3xl p-8 md:p-12 text-center animate-scale-in">
          <h3 className="text-3xl font-playfair font-bold text-rose-800 mb-6">
            Join 2,500+ people who've transformed their relationships
          </h3>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/60 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-rose-600 mb-2">10,000+</div>
              <p className="text-rose-700/80">Personalized activity ideas delivered</p>
            </div>
            <div className="bg-white/60 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-rose-600 mb-2">85%</div>
              <p className="text-rose-700/80">Report trying new activities</p>
            </div>
            <div className="bg-white/60 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-rose-600 mb-2">40%</div>
              <p className="text-rose-700/80">More quality time with loved ones</p>
            </div>
          </div>
          <p className="text-lg text-rose-700/80 max-w-3xl mx-auto">
            "We went from the same weekend routine to trying pottery classes, farmers markets, 
            and that amazing hiking trail we never knew existed. Careloom helped us fall in love 
            with our city again and gave us ideas for every type of relationship!" - Sarah & Mike
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
