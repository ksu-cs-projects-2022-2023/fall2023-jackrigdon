
using SkydiveAtlasAPI.Models;

namespace SkydiveAtlasAPI
{
    public interface IUserService
    {
        //Task<Models.User> AuthenticateAsync(string oauthId);
        Task<Models.User> CreateUserAsync(Models.OAuthCredentials credentials);
        Task<User> GetUserByUsernameAsync(string username);
        Task<List<Review>> GetReviewsByCoordinates(double latitude, double longitude);
    }
}
