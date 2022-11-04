using backend_api.Models.Accounts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;

namespace backend_api.Controllers;

[ApiController]

[Route("[controller]")]
public class AccountsController : ControllerBase {
    [AllowAnonymous]
    [HttpPost("authenticate")]
    public ActionResult<AuthenticateResponse> Authenticate(AuthenticateRequest model) {
        // Start code from AccountService
        if (!(model.Email == "user@example.com" && model.Password == "string" ))
            return Unauthorized(new { ErrorMessage = "Invalid email or password"});

        var response = new AuthenticateResponse {
            Id = 1234,
            Title = "John Doe",
            FirstName = "John",
            LastName = "Doe",
            Email = "user@example.com",
            Role = "Admin",
            Created = new DateTime(2020, 1, 1),
            IsVerified = true,
            JwtToken = GenerateJwtToken(1234)
        };        
        // response.RefreshToken = refreshToken.Token;

        
        // setTokenCookie(response.RefreshToken);
        // End code from AccountService
        return Ok(response);
    }

    [AllowAnonymous]
    [HttpPost("authenticate-ext")]
    public ActionResult<AuthenticateResponse> AuthenticateExternalUser(AuthenticateExternalUserRequest model) {
        int.TryParse(model.Sub, out var id);
        var response = new AuthenticateResponse {
            Id = id,
            Title = model.Name,
            //FirstName = "John",
            //LastName = "Doe",
            Email = model.EMail,
            Role = "Other",
            Created = new DateTime(2020, 1, 1),
            IsVerified = true,
            JwtToken = GenerateJwtToken(id)
        };
        return Ok(response);
    }


    // Original on JwtUtils
    string GenerateJwtToken(int id) {
        // generate token that is valid for 15 minutes
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("some secret very very long");
        var tokenDescriptor = new SecurityTokenDescriptor {            
            Audience = "myapi",
            Issuer = "myapi",            
            Subject = new ClaimsIdentity(new[] { new Claim("id", id.ToString()) }),
            Expires = DateTime.UtcNow.AddMinutes(15),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
