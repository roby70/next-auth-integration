# Caso di studio su autenticazione mista .NET e NextAuth.js

Progetto per la verifica dell'integrazione tra backend .NET API con autorizzazione JWT e applicazione React Next.js che utilizzi NextAuth.js per l'autenticazione degli utenti.

Il caso di studio prevede:

- possibilità di autenticare gli utenti tramite username/email e password con metodologia *legacy* che prevede la chiamata all'endpoint .NET `Accounts/authenticate`
- possibilità di autenticare gli utenti tramite provider esterni (quali Google Auth) attraverso la libreria *NextAuth.js* 
- il sistema dovrà utilizzare la API .NET andando a specificare nelle chiamate il JWT Bearer token fornito al momento dell'autenticazione, nel caso di autenticazione tramite NextAuth.js e provider esterno il server node.js dovrà contattare la API di autenticazione .NET per farsi rilasciare un token valido

## Progetto backend-api

Il progetto backend-api è un progetto ASP.NET 6.0 che prevede due controller:

- AccountsController: dedicato all'autenticazione degli utenti
- WeatherForecastController: derivante direttamente dal template di progetto, in cui il metodo get prevede l'autenticazione degli utenti e restituisce un elenco di temperature 

## Progetto next-auth-example

Il progetto next-auth-example è un progetto React che deriva direttamente dal tutorial di [NextAuth.js]([NextAuth.js (next-auth.js.org)](https://next-auth.js.org/)), in particolare deriva dal progetto [nextauthjs/next-auth-example (github.com)](https://github.com/nextauthjs/next-auth-example) .

## Personalizzazione NextAuth.js

Per gestire il caso di studio sono state implementate le seguenti personalizzazioni.
In linea di massima tutto il codice risiede nel file `[...nextauth].ts`

### Gestione autenticazione tramite email e password

L'autenticazione tramite email e password è stata gestita andando ad includere un provider di tipo `CredentialsProvider`  tra quelli gestiti in NextAuth.js.

Nel provider sono stati prima di tutto configurati i dati da richiedere all'utente nella form

```typescript
credentials: {
  email: { label: "EMail", type: "text", placeholder: "jsmith" },
  password: {  label: "Password", type: "password" }
},
```

Quindi è stato definito il metodo per richiedere l'autenticazione all'API esterna (nel nostro caso l'endpoint .NET `Accounts/authenticate`)

```typescript
async authorize(credentials, req) {
  const requestBody = JSON.stringify({email: credentials?.email, password: credentials?.password})
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
	if (res.ok && user) {
	  return user
	}
	return null
  } catch (ex) {
	console.log(ex);
	throw ex;
  }
}
```

Nel caso specifico dalla chiamata si ottiene un oggetto contenente anche la proprietà jwtToken.

### Gestione token per autenticazione tramite provider

Nel caso in cui l'utente decida di autenticarsi tramite provider esterno occorre recuperare il token JWT dalla API .NET. 

In questo caso si può utilizzare la callback `jwt` prevista in NextAuth.js. 
Da notare che questa callback viene richiamata a seguito di un qualsiasi processo di autenticazione.

Nel caso specifico viene richiamato un endpoint .net specifico per generare un token jwt ed eventualmente allineare la base dati degli utenti

```typescript
callbacks: {
	async jwt({ token, user, account, profile }) {
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
```

> Per distinguere l'autenticazione tramite email e password viene utilizzato l'oggetto user che viene ritornato dal `CredentialsProvider`  nel metodo `authrorize`. In questo caso è presente il token jwt già fornito dall'endpoint .NET.

> Le informazioni passate alla callback sono diverse, probabilmente a seconda del tipo di provider è necessario andare a verificare quelle disponibili che possono essere necessarie per il backend. Nell'esempio viene semplicemente passato il token ottenuto dal provider.

## Esclusioni ed Annotazioni

Il caso di studio non gestisce il token di refresh, presente nello use case originale.

Le implementazioni sono semplificate, per cui lato server .NET non è gestito un repository degli utenti, ma è gestito un solo utente configurato direttamente nel codice.

I test sono stati effettuati con il solo provider esterno Google, non dovrebbero esserci sostanziali differenze rispetto ad altri provider.

Nel file .env.local è stato inserita l'impostazione `NODE_TLS_REJECT_UNAUTHORIZED="0"` per permetttere la chiamata al server .NET in ambiente di sviluppo, che utilizza il protocollo HTTPS con un self signed certificate.