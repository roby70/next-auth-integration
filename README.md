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
