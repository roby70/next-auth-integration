namespace backend_api.Models.Accounts;

public class AuthenticateExternalUserRequest {    
    public string Sub { get; set; }

    public string Name { get; set; }

    public string EMail { get; set; }

}
