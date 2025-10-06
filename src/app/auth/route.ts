import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: "common",
    })
  ],
  callbacks: {
    async session({ session }) {
      if (session?.user?.name) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_name', session.user.name)
        }
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }