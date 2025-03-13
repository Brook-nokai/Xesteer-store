import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { OWNER_EMAIL, SUB_OWNER_EMAIL } from "@/lib/constants";
import { User } from "@shared/schema";

export function setupAuth() {
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Only setup Discord and Google strategies if credentials are available
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    // Discord Strategy
    passport.use(new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: "/api/auth/discord/callback",
      scope: ["identify", "email"]
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await storage.getUserByDiscordId(profile.id);

        if (!user) {
          const role = profile.email === OWNER_EMAIL 
            ? "owner" 
            : profile.email === SUB_OWNER_EMAIL 
              ? "sub-owner" 
              : "user";

          user = await storage.createUser({
            email: profile.email!,
            name: profile.username,
            avatar: profile.avatar,
            role,
            discordId: profile.id,
            googleId: null
          });
        }

        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }));
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Google Strategy  
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await storage.getUserByGoogleId(profile.id);

        if (!user) {
          const email = profile.emails![0].value;
          const role = email === OWNER_EMAIL 
            ? "owner" 
            : email === SUB_OWNER_EMAIL 
              ? "sub-owner" 
              : "user";

          user = await storage.createUser({
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0].value,
            role,
            googleId: profile.id,
            discordId: null
          });
        }

        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }));
  }
}