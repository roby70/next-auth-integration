import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { json } from "stream/consumers";


// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "EMail", type: "text", placeholder: "jsmith" },
        password: {  label: "Password", type: "password" }
      }, 
      async authorize(credentials, req) {
        const requestBody = JSON.stringify({email: credentials?.email, password: credentials?.password})
        console.log("Sending request to authenticate user to " + process.env.CREDENTIALS_ENDPOINT + " with credentials: "  + requestBody)
        try {
          const res = await fetch(process.env.CREDENTIALS_ENDPOINT+"/Accounts/authenticate", {
            method: 'POST',
            mode: 'no-cors',
            body: requestBody,
            headers: { 
              "Content-Type": "application/json;charset=UTF-8",
              "Accept": "*/*"
            }
          })
          const user = await res.json()
          console.log("Successfully authenticated user")
          console.log(user)
    
          // If no error and we have user data, return it
          if (res.ok && user) {
            return user
          }
          // Return null if user data could not be retrieved
          return null
        } catch (ex) {
          console.log("Error during authentication of user")          
          console.log(ex);
          throw ex;
        }
        
      }
    })
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      console.log("Token received")
      console.log(token)
      if (user) {
        console.log("User received")
        console.log(user)
      }
      if (account) {
        console.log("Account received")
        console.log(account)
      }
      if (profile) {
        console.log("profile received")
        console.log(profile)
      }
      if (user && user.jwtToken) {
        console.log("jwtToken already included in credentials: " + user.jwtToken)
      } else {
        console.log("Call API to retrieve backend jwtToken")
        const requestBody = JSON.stringify(token)
        const res = await fetch(process.env.CREDENTIALS_ENDPOINT+"/Accounts/authenticate-ext", {
          method: 'POST',
          mode: 'no-cors',
          body: requestBody,
          headers: { 
            "Content-Type": "application/json;charset=UTF-8",
            "Accept": "*/*"
          }
        })
        const user = await res.json()
        console.log("Token received from server: " + user.jwtToken)
      }
      
      return token
    },
  },
}

export default NextAuth(authOptions)
