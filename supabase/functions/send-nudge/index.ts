
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NudgeRequest {
  userId: string;
  userEmail: string;
  userName: string;
  partnerName?: string;
  city?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Send-nudge function called');
    
    // Get the authorization header to verify the user
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('No authorization header found');
      throw new Error('No authorization header');
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    console.log('JWT token extracted, length:', token.length);

    // Initialize Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('Creating Supabase client for user authentication');
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Set the session with the token
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw userError;
    }
    
    if (!user) {
      console.log('No user found in auth context');
      throw new Error('User not authenticated');
    }

    console.log('Authenticated user found:', user.email);

    // Use service role client to get user's relationships
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: relationships, error: relationshipsError } = await supabaseService
      .from('relationships')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });

    if (relationshipsError) {
      console.error('Error fetching relationships:', relationshipsError);
      throw relationshipsError;
    }

    // Pick the first relationship (most recent) for personalization
    const relationship = relationships?.[0];
    
    if (!relationship) {
      console.log('No relationships found for user');
      throw new Error('No relationships found. Please add a relationship first.');
    }

    console.log('Using relationship for personalization:', relationship.name, relationship.relationship_type);

    const userEmail = user.email!;
    const userName = user.user_metadata?.full_name || userEmail.split('@')[0];
    
    // Get current day and time for personalization
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';

    // Create personalized content based on relationship type
    const getPersonalizedContent = (rel: any) => {
      const isPartner = rel.relationship_type === 'partner';
      const isFamily = rel.relationship_type === 'family';
      const isFriend = rel.relationship_type === 'friend';
      
      const relationshipContext = isPartner ? 'your relationship' : 
                                 isFamily ? 'your family bond' : 
                                 'your friendship';
      
      const connectionWord = isPartner ? 'romance' : 
                            isFamily ? 'family connection' : 
                            'friendship';

      const experiences = isPartner ? [
        {
          title: `The "Just You Two" Coffee Ritual`,
          description: `Find a quiet corner at your favorite local café and create a 30-minute phone-free zone. Set your devices aside and dive into these conversation starters designed for couples: "What's one thing about our relationship that surprised you this month?" or "If we could travel anywhere together next year, where would you want to go and why?"`,
          why: `Couples who regularly engage in novel conversations report 23% higher relationship satisfaction. Removing digital distractions allows for the deep eye contact that builds intimacy.`,
          icon: "☕"
        },
        {
          title: `The ${rel.name} Memory Lane Walk`,
          description: `Take a 30-minute sunset walk together in your most scenic local area. Share three things: one memory from when you first met, one thing you're grateful for about ${rel.name} right now, and one dream you have for your future together. Take turns asking: "What's one way I could love you better this week?"`,
          why: `Walking side-by-side naturally reduces relationship tension and promotes open communication. Sharing gratitude increases relationship satisfaction by 25%.`,
          icon: "🌅"
        },
        {
          title: `The "First Time Together" Adventure`,
          description: `Visit somewhere in your area that neither of you has been before - a bookstore, park, farmer's market, or local gallery. Spend 45 minutes exploring together, then find a spot to share: "What's one small thing ${rel.name} did today that made you smile?" Document the moment with one meaningful photo together.`,
          why: `Novel experiences trigger dopamine and create stronger couple bonding. Sharing daily appreciations builds positive relationship patterns.`,
          icon: "📸"
        }
      ] : isFamily ? [
        {
          title: `The Family Heritage Coffee Chat`,
          description: `Meet ${rel.name} at a cozy local café for a phone-free 45-minute conversation. Come prepared with family photos on your phone (then put it away!) and ask: "What's a family tradition you want to make sure we never lose?" and "What's one thing you learned from our family that you're grateful for?"`,
          why: `Family bonds strengthen when we connect over shared history and values. Research shows that families who discuss their heritage have children with higher self-esteem.`,
          icon: "☕"
        },
        {
          title: `The ${rel.name} Appreciation Walk`,
          description: `Take a meaningful walk together in your neighborhood or a local park. Share three specific things you appreciate about ${rel.name} and ask them to do the same. End by asking: "What's one way our family could spend more quality time together?" Focus on being fully present without devices.`,
          why: `Family members who regularly express appreciation report 40% stronger family bonds. Walking together naturally encourages deeper sharing.`,
          icon: "🌳"
        },
        {
          title: `The Memory-Making Family Experience`,
          description: `Visit a local spot that holds family significance or explore somewhere new together - maybe a farmers market, museum, or scenic viewpoint. Spend time sharing stories about your family history and ask ${rel.name}: "What's your favorite memory of us together?" Create one new memory to add to your collection.`,
          why: `Families who create regular new experiences together build stronger emotional connections and better communication patterns.`,
          icon: "🏛️"
        }
      ] : [
        {
          title: `The "Real Talk" Coffee Connection`,
          description: `Meet ${rel.name} at a local coffee shop and create a genuine catch-up session. Put phones in airplane mode and spend 45 minutes with these friendship-deepening questions: "What's been the highlight and the challenge of your month?" and "What's one thing you're excited about that I might not know about yet?"`,
          why: `Deep friendships require vulnerability and presence. Friends who regularly have meaningful conversations report 67% stronger friendship satisfaction.`,
          icon: "☕"
        },
        {
          title: `The ${rel.name} Adventure Discovery`,
          description: `Plan a mini-adventure together - explore a new neighborhood, visit a local market, or check out that place you've both been meaning to try. During your time together, share appreciation: "What's one thing I value most about our friendship?" and "What's been your favorite memory of us this year?"`,
          why: `Shared novel experiences strengthen friendship bonds and create positive memories that last. Active appreciation builds deeper friendship connections.`,
          icon: "🗺️"
        },
        {
          title: `The Screen-Free Friend Date`,
          description: `Choose an activity that naturally keeps phones away - a walk in nature, browsing a bookstore, or trying a new local restaurant. Focus entirely on ${rel.name} and ask: "What's something you've been thinking about lately that you'd love to talk through?" and "How can I be a better friend to you?"`,
          why: `Undivided attention is the greatest gift we can give friends. Quality time without digital distractions increases friendship intimacy by 45%.`,
          icon: "🤝"
        }
      ];

      return { experiences, relationshipContext, connectionWord };
    };

    const { experiences, relationshipContext, connectionWord } = getPersonalizedContent(relationship);

    // Create highly personalized subject line
    const subjectLine = relationship.relationship_type === 'partner' 
      ? `💕 3 ways to deepen your connection with ${relationship.name} this week`
      : relationship.relationship_type === 'family'
      ? `🌟 Meaningful moments to share with ${relationship.name} this week`  
      : `✨ 3 ways to strengthen your friendship with ${relationship.name}`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #fefcfa 0%, #fdf2f4 100%);">
        
        <!-- Header with personal greeting -->
        <div style="background: linear-gradient(135deg, #9d4e65 0%, #c08862 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.2;">
            Hey ${userName}! 👋
          </h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 400;">
            3 meaningful ways to connect with ${relationship.name} this ${dayOfWeek} ${timeOfDay}
          </p>
        </div>

        <!-- Personal introduction -->
        <div style="padding: 30px 30px 20px 30px; background: white;">
          <div style="background: #f9f4f1; border-left: 4px solid #db889b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #4c333e; font-size: 16px; line-height: 1.5;">
              <strong>Your ${relationshipContext} with ${relationship.name} deserves more than competing with screens.</strong> In a world where we check our phones 96 times per day, you've chosen to prioritize real connection. Here are 3 research-backed ways to create meaningful moments together that go far beyond typical activities.
            </p>
          </div>
        </div>

        <!-- Personalized connection experiences -->
        <div style="padding: 0 30px; background: white;">
          ${experiences.map((experience, index) => `
            <div style="margin-bottom: 25px; background: #fefefe; border: 1px solid #f0e6e8; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(157, 78, 101, 0.08);">
              <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                <div style="font-size: 24px; margin-right: 15px; flex-shrink: 0;">${experience.icon}</div>
                <div style="flex-grow: 1;">
                  <h3 style="color: #9d4e65; font-size: 20px; font-weight: 600; margin: 0 0 10px 0;">${experience.title}</h3>
                </div>
              </div>
              
              <p style="color: #4c333e; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                ${experience.description}
              </p>
              
              <div style="background: #f9f4f1; border-radius: 8px; padding: 15px; border-left: 3px solid #c08862;">
                <p style="margin: 0; color: #8b6f47; font-size: 14px; font-style: italic;">
                  <strong>💡 Why this works:</strong> ${experience.why}
                </p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Personal connection challenge -->
        <div style="padding: 0 30px 30px 30px; background: white;">
          <div style="background: linear-gradient(135deg, #db889b 0%, #c08862 100%); border-radius: 12px; padding: 25px; text-align: center; color: white;">
            <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">
              📵 Your Personal Connection Challenge
            </h3>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0; opacity: 0.95;">
              Choose one experience above to try with ${relationship.name} this week. Notice how it feels to be fully present together, then share your favorite moment from it with someone else who matters to you.
            </p>
            <p style="font-size: 14px; margin: 0; opacity: 0.8;">
              <strong>Remember:</strong> The goal isn't perfection—it's presence with ${relationship.name}.
            </p>
          </div>
        </div>

        <!-- Personal closing -->
        <div style="padding: 20px 30px 30px 30px; background: white; text-align: center;">
          <p style="color: #9d4e65; font-size: 16px; margin: 0 0 15px 0; line-height: 1.5;">
            💝 ${userName}, you're already choosing ${connectionWord} over digital distraction.<br/>
            These moments with ${relationship.name} will become the memories you treasure most.
          </p>
          <p style="color: #8b7479; font-size: 14px; margin: 0;">
            This is just the beginning of prioritizing what matters most in your relationships.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9f4f1; padding: 25px 30px; text-align: center; border-top: 1px solid #f0e6e8;">
          <p style="color: #8b7479; font-size: 14px; margin: 0 0 10px 0;">
            Sent with intention from Careloom 💕
          </p>
          <p style="color: #a39298; font-size: 12px; margin: 0; line-height: 1.4;">
            Helping people like you choose presence over digital distraction<br/>
            <em>"In a world of endless notifications, your presence is the most precious gift."</em>
          </p>
        </div>
      </div>
    `;

    console.log('Sending personalized email via Resend');

    const emailResponse = await resend.emails.send({
      from: "Careloom <careloom@resend.dev>",
      to: [userEmail],
      subject: subjectLine,
      html: emailHtml,
    });

    console.log("Personalized nudge email sent successfully:", emailResponse);

    // Record the event in database
    console.log('Recording personalized event in database');
    
    const { error: eventError } = await supabaseService
      .from('events')
      .insert({
        relationship_id: relationship.id,
        event_type: 'personalized_nudge_sent',
        metadata: {
          action_description: `Sent personalized ${relationship.relationship_type} connection nudge`,
          relationship_name: relationship.name,
          relationship_type: relationship.relationship_type,
          user_id: user.id,
          user_email: userEmail,
          email_type: 'highly_personalized_connection_nudge'
        }
      });

    if (eventError) {
      console.error('Error recording event:', eventError);
    } else {
      console.log('Event recorded successfully');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      personalizedFor: relationship.name,
      relationshipType: relationship.relationship_type
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-nudge function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
