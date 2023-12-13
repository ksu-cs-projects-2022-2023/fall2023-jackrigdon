using SkydiveAtlasAPI.Models;
using Microsoft.EntityFrameworkCore;
namespace SkydiveAtlasAPI
{
    public class UserService : IUserService
    {
        private readonly SkydiveAtlasContext _context;

        public UserService(SkydiveAtlasContext context)
        {
            _context = context;
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.username == username);
        }

        public async Task<User> CreateUserAsync(OAuthCredentials credentials)
        {
            var newUser = new User
            {
                first_name = credentials.first_name,
                last_name = credentials.last_name,
                username = credentials.username
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser;
        }

        public async Task<List<Review>> GetReviewsByCoordinates(double latitude, double longitude)
        {
            double range = 0.01; // Define a range for latitude and longitude

            var reviews = await _context.Reviews
                .Where(r => r.Latitude >= latitude - range && r.Latitude <= latitude + range
                         && r.Longitude >= longitude - range && r.Longitude <= longitude + range)
                .ToListAsync();

            return reviews;
        }
    }

}
