
import { Calendar, Heart, Mail } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-rose-500" />,
      title: "Smart Reminders",
      description: "Never forget birthdays, anniversaries, or special moments. Our AI learns your important dates and sends gentle nudges at just the right time.",
      gradient: "from-rose-100 to-rose-50"
    },
    {
      icon: <Heart className="h-8 w-8 text-rose-500 fill-rose-200" />,
      title: "Curated Date Plans",
      description: "Get personalized date ideas based on your interests, budget, and location. From cozy nights in to adventurous outings, we've got you covered.",
      gradient: "from-cream-100 to-cream-50"
    },
    {
      icon: <Mail className="h-8 w-8 text-rose-500" />,
      title: "Thoughtful Nudges",
      description: "Gentle prompts to check in, send a sweet message, or plan something special. Keep your relationships flourishing with minimal effort.",
      gradient: "from-sage-100 to-sage-50"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-rose-800 mb-6">
            How Careloom helps you
            <span className="text-gradient block">stay connected</span>
          </h2>
          <p className="text-xl text-rose-700/80 max-w-2xl mx-auto">
            Our AI assistant works quietly in the background, 
            making sure love never goes unnoticed.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className={`bg-gradient-to-br ${feature.gradient} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full`}>
                {/* Icon */}
                <div className="mb-6">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-playfair font-semibold text-rose-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-rose-700/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlight */}
        <div className="mt-20 bg-gradient-to-r from-rose-50 to-cream-50 rounded-3xl p-8 md:p-12 text-center animate-scale-in">
          <h3 className="text-3xl font-playfair font-bold text-rose-800 mb-4">
            Built for real relationships
          </h3>
          <p className="text-lg text-rose-700/80 max-w-3xl mx-auto">
            Whether you're in a long-term partnership, nurturing close friendships, 
            or staying connected with family, Careloom adapts to your unique relationships 
            and helps you show up consistently for the people who matter most.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
