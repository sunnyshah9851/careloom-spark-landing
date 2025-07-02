
import { Calendar, Heart, Mail, User, Settings, Bell, MapPin, Coffee, Star } from 'lucide-react';

const FeaturesSection = () => {
  const steps = [
    {
      number: "01",
      icon: <User className="h-8 w-8 text-rose-500" />,
      title: "Share what connection means to you",
      description: "Tell us about your relationships and what makes them special so we can suggest experiences that bring you closer together.",
      gradient: "from-rose-100 to-rose-50"
    },
    {
      number: "02", 
      icon: <Settings className="h-8 w-8 text-rose-500" />,
      title: "Choose your connection rhythm",
      description: "Decide how often you want gentle nudges to prioritize quality time - because the best relationships need intentional care.",
      gradient: "from-cream-100 to-cream-50"
    },
    {
      number: "03",
      icon: <Bell className="h-8 w-8 text-rose-500" />,
      title: "Get inspired to connect",  
      description: "Receive thoughtful suggestions designed to help you step away from screens and create meaningful moments with those you love.",
      gradient: "from-sage-100 to-sage-50"
    }
  ];

  const features = [
    {
      icon: <Heart className="h-8 w-8 text-rose-500 fill-rose-200" />,
      title: "Connection-First Experiences",
      description: "Every suggestion is designed to foster deeper bonds. We focus on activities that encourage conversation, laughter, and shared discovery rather than passive entertainment.",
      gradient: "from-rose-100 to-rose-50",
      examples: ["Conversation-sparking experiences", "Screen-free quality time ideas", "Memory-making adventures", "Relationship-strengthening activities"]
    },
    {
      icon: <MapPin className="h-8 w-8 text-rose-500" />,
      title: "Rediscover Your World Together",
      description: "Explore hidden gems in your own backyard. We help you see your city through fresh eyes and discover places that become 'your spots' with the people you care about.",
      gradient: "from-cream-100 to-cream-50", 
      examples: ["Local connection spots", "Seasonal gathering places", "Unique shared experiences", "Community events to enjoy together"]
    },
    {
      icon: <Calendar className="h-8 w-8 text-rose-500" />,
      title: "Never Miss Moments That Matter",
      description: "In our busy digital lives, important moments can slip by. We gently remind you when it's time to celebrate, connect, and show the people in your life that they matter.",
      gradient: "from-sage-100 to-sage-50",
      examples: ["Relationship milestone reminders", "Perfect timing for surprises", "Connection opportunity alerts", "Meaningful celebration ideas"]
    }
  ];

  const sampleIdeas = [
    {
      title: "Digital Detox Coffee Date",
      description: "Visit that cozy café you bookmarked, leave phones in the car, and ask each other the conversation starters we'll send you",
      budget: "$15-25",
      time: "2-3 hours",
      connection: "Deep conversation"
    },
    {
      title: "Family Memory Walk", 
      description: "Take a sunset stroll through your neighborhood, collect interesting leaves, and share favorite childhood memories",
      budget: "$0-10",
      time: "1-2 hours",
      connection: "Storytelling"
    },
    {
      title: "Partner Adventure Challenge",
      description: "Try that pottery class you both mentioned, then cook dinner together using ingredients from the farmers market",
      budget: "$60-90", 
      time: "4-5 hours",
      connection: "Shared learning"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-rose-800 mb-6">
            From digital distraction to
            <span className="text-gradient block">meaningful connection</span>
          </h2>
          <p className="text-xl text-rose-700/80 max-w-2xl mx-auto">
            Stop letting screens steal your most precious resource: quality time with the people who matter. 
            Start creating the connections you'll remember forever.
          </p>
        </div>

        {/* Sample Activity Ideas Preview */}
        <div id="preview" className="mb-20">
          <h3 className="text-3xl font-playfair font-bold text-rose-800 text-center mb-8">
            What real connection looks like
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
                <div className="flex justify-between text-sm text-rose-600/70 mb-2">
                  <span>💰 {idea.budget}</span>
                  <span>⏱️ {idea.time}</span>
                </div>
                <div className="text-xs text-rose-500 font-medium bg-rose-100/50 rounded-full px-3 py-1 w-fit">
                  💝 {idea.connection}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-rose-600/70 text-lg">
              📧 Gentle weekly nudges to prioritize what matters most
            </p>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="mb-20">
          <h3 className="text-3xl font-playfair font-bold text-rose-800 text-center mb-12">
            Your journey to deeper connection
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
            Why people choose real connection
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
            Join 2,500+ people prioritizing real connection
          </h3>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/60 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-rose-600 mb-2">89%</div>
              <p className="text-rose-700/80">Feel more connected to loved ones</p>
            </div>
            <div className="bg-white/60 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-rose-600 mb-2">76%</div>
              <p className="text-rose-700/80">Spend less time on their phones</p>
            </div>
            <div className="bg-white/60 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-rose-600 mb-2">92%</div>
              <p className="text-rose-700/80">Created memories they'll treasure</p>
            </div>
          </div>
          <p className="text-lg text-rose-700/80 max-w-3xl mx-auto">
            "We realized we were living parallel lives, always on our phones even when together. 
            Careloom helped us rediscover what we loved about each other and our city. Now we have 
            weekly adventures instead of weekly Netflix binges." - Sarah & Mike
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
