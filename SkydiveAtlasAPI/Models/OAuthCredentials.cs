namespace SkydiveAtlasAPI.Models
{
    public class OAuthCredentials
    {
        //public string OAuthId { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string username { get; set; }
    }

    public class User
    {
        public int Id { get; set; }
        //public string OAuthId { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string username { get; set; }
    }

    public class OAuthToken
    {
        public string Token { get; set; }
    }


}
