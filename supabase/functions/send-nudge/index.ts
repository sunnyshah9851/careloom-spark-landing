
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

    const { userId, userName, partnerName, city }: NudgeRequest = await req.json();

    // Use the authenticated user's email instead of the one from the request
    const userEmail = user.email!;
    console.log('Sending nudge to:', userEmail);

    // Get current day and time for personalization
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';

    // Create personalized connection experiences (not just activities)
    const connectionExperiences = [
      {
        title: "The 'No-Phone Zone' Coffee Ritual",
        description: city 
          ? `Find a cozy corner at a local café in ${city} and create a 30-minute phone-free zone. Stack your devices in the center of the table and dive into these conversation starters: "What's been surprising you lately?" or "If you could master any skill instantly, what would it be?"` 
          : "Create a 30-minute phone-free zone at your favorite local café. Stack your devices in the center of the table and explore questions like: 'What's been surprising you lately?' or 'If you could master any skill instantly, what would it be?'",
        why: "Studies show that the mere presence of phones reduces conversation quality by 37%. Removing the distraction creates space for genuine curiosity.",
        icon: "☕"
      },
      {
        title: "The Sunset Reflection Walk",
        description: city 
          ? `Take a 20-minute walk during golden hour in ${city}'s most scenic area. Share one thing you're grateful for and one challenge you're facing. Take turns asking: "What would your younger self be proud of about who you are today?"`
          : "Take a 20-minute walk during golden hour in your most scenic local area. Share one thing you're grateful for and one challenge you're facing. Ask each other: 'What would your younger self be proud of about who you are today?'",
        why: "Walking side-by-side (rather than face-to-face) reduces social pressure and naturally encourages deeper sharing.",
        icon: "🌅"
      },
      {
        title: "The Memory-Making Challenge",
        description: city 
          ? `Visit somewhere in ${city} that neither of you has been before - a bookstore, park, or local market. Set a timer for 45 minutes to explore together, then find a spot to answer: "What's one small thing that made you smile today?" Document the moment with one meaningful photo together.`
          : "Visit somewhere locally that neither of you has been before - a bookstore, park, or local market. Explore for 45 minutes, then find a spot to share: 'What's one small thing that made you smile today?' Capture one meaningful photo together.",
        why: "Novel experiences trigger dopamine and create stronger memory formation, making ordinary moments feel special.",
        icon: "📸"
      }
    ];

    const partnerText = partnerName ? ` and ${partnerName}` : " and the people who matter most";
    const personalGreeting = partnerName ? `for you and ${partnerName}` : "for your most important relationships";

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #fefcfa 0%, #fdf2f4 100%);">
        
        <!-- Header with emotional hook -->
        <div style="background: linear-gradient(135deg, #9d4e65 0%, #c08862 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.2;">
            🌟 Your Escape from Endless Scrolling
          </h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 400;">
            3 proven ways to reconnect beyond the screen this ${dayOfWeek} ${timeOfDay}
          </p>
        </div>

        <!-- Personal introduction -->
        <div style="padding: 30px 30px 20px 30px; background: white;">
          <div style="background: #f9f4f1; border-left: 4px solid #db889b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #4c333e; font-size: 16px; line-height: 1.5;">
              <strong>Hi there!</strong> In a world where we check our phones 96 times per day, you've made the choice to prioritize real connection${partnerText}. Here are 3 research-backed experiences ${personalGreeting} that go far beyond typical "date ideas."
            </p>
          </div>
        </div>

        <!-- Connection experiences -->
        <div style="padding: 0 30px; background: white;">
          ${connectionExperiences.map((experience, index) => `
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

        <!-- Digital detox challenge -->
        <div style="padding: 0 30px 30px 30px; background: white;">
          <div style="background: linear-gradient(135deg, #db889b 0%, #c08862 100%); border-radius: 12px; padding: 25px; text-align: center; color: white;">
            <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">
              📵 This Week's Connection Challenge
            </h3>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0; opacity: 0.95;">
              Try one experience above and notice how it feels to be fully present. Then, share your favorite moment from it with someone who wasn't there.
            </p>
            <p style="font-size: 14px; margin: 0; opacity: 0.8;">
              <strong>Remember:</strong> The goal isn't perfection—it's presence.
            </p>
          </div>
        </div>

        <!-- Gentle next steps -->
        <div style="padding: 20px 30px 30px 30px; background: white; text-align: center;">
          <p style="color: #9d4e65; font-size: 16px; margin: 0 0 15px 0; line-height: 1.5;">
            💝 You're already choosing connection over digital distraction.<br/>
            These moments will become the memories you treasure most.
          </p>
          <p style="color: #8b7479; font-size: 14px; margin: 0;">
            This is just the beginning of your journey back to what matters most.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9f4f1; padding: 25px 30px; text-align: center; border-top: 1px solid #f0e6e8;">
          <p style="color: #8b7479; font-size: 14px; margin: 0 0 10px 0;">
            Sent with intention from Careloom 💕
          </p>
          <p style="color: #a39298; font-size: 12px; margin: 0; line-height: 1.4;">
            Helping 2,500+ people choose presence over digital distraction<br/>
            <em>"In a world of endless notifications, your presence is the most precious gift."</em>
          </p>
        </div>
      </div>
    `;

    console.log('Sending enhanced email via Resend');

    const emailResponse = await resend.emails.send({
      from: "Careloom <careloom@resend.dev>",
      to: [userEmail],
      subject: "🌟 Your escape from endless scrolling starts here",
      html: emailHtml,
    });

    console.log("Enhanced nudge email sent successfully:", emailResponse);

    // Use service role client for database operations to bypass RLS
    console.log('Recording event in database with service role');
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: eventError } = await supabaseService
      .from('events')
      .insert({
        relationship_id: null, // Set as null since this is a user-level action, not relationship-specific
        event_type: 'nudge_requested',
        metadata: {
          action_description: 'Requested enhanced connection experiences via email nudge',
          partner_name: partnerName,
          city: city,
          user_id: user.id,
          user_email: userEmail,
          email_type: 'enhanced_wow_factor'
        }
      });

    if (eventError) {
      console.error('Error recording event:', eventError);
      // Don't throw here, just log the error since the main function succeeded
    } else {
      console.log('Event recorded successfully');
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
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
