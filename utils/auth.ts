import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import Doctor from "@/models/Doctor";
import bcrypt from "bcryptjs";
import { Patient } from "@/models/Patient";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectToDatabase();
        const user = await Doctor.findOne({ email: credentials.email }).select("+password");

        if (user) {
          const passwordMatches = await bcrypt.compare(credentials.password, user.password);
          if (!passwordMatches) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            role: "doctor",
          };
        }

        const patient = await Patient.findOne({ email: credentials.email }).select("+password");
        if (!patient?.password || !(await bcrypt.compare(credentials.password, patient.password))) {
          return null;
        }

        return {
          id: patient._id.toString(),
          email: patient.email,
          name: patient.name,
          role: "patient",
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: "doctor" | "patient" }).role;
      }
      return token;
    },
    async session({ session, token }) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as "doctor" | "patient"
        };
        return session;
      }

  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET
};
