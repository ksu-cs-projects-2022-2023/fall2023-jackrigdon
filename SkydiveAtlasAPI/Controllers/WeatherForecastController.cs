using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SkydiveAtlasAPI.Models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace SkydiveAtlasAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("MyAllowSpecificOrigins")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private static List<SkydivingLocation> _cachedLocations;
        private static DateTime _lastUpdated;
        private const string ApiKey = "9a987c9434dd69ba9a0714016970da7e";
        private readonly string _jsonFilePath = "skydiving_locationz.json";
        private readonly IUserService _userService;
        private readonly ILogger<WeatherForecastController> _logger;

        private readonly SkydivingLocationService _locationService;
        private readonly WeatherDataService _weatherService;
        private readonly SkydiveAtlasContext _context;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, SkydivingLocationService locationService, WeatherDataService weatherService, IUserService userService, SkydiveAtlasContext context)
        {
            _logger = logger;
            _locationService = locationService;
            _weatherService = weatherService;
            _userService = userService;
            if (_cachedLocations == null)
            {
                _cachedLocations = new List<SkydivingLocation>();
                _lastUpdated = DateTime.MinValue;
            }
            _context = context;
        }

        [HttpGet("forecast", Name = "GetWeatherForecast")]
        public IEnumerable<WeatherForecast> Get()
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateTime.Now.AddDays(index),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }

        /*[HttpGet("skydiving-locations", Name = "GetSkydivingLocations")]
        public async Task<IEnumerable<SkydivingLocation>> GetSkyDivingLocations()
        {
            var jsonFilePath = "skydiving_locationz.json";
            var skydivingLocations = _locationService.ReadSkydivingLocationsFromJson(jsonFilePath);
            var apiKey = "9a987c9434dd69ba9a0714016970da7e";
            //var limitedLocations = skydivingLocations.Take(10).ToList();

            foreach (var location in skydivingLocations)
            {
                location.Weather = await _weatherService.FetchWeatherDataAsync(location.Latitude, location.Longitude, apiKey);
            }

            return skydivingLocations;
        }*/

        [HttpGet("skydiving-locations", Name = "GetSkydivingLocations")]
        public async Task<IEnumerable<SkydivingLocation>> GetSkyDivingLocations()
        {
            var skydivingLocations = _locationService.ReadSkydivingLocationsFromJson(_jsonFilePath);
            //var limitedLocations = skydivingLocations.Take(10).ToList();

            bool isWeatherDataUpdated = false;

            foreach (var location in skydivingLocations)
            {
                // Always update the reviews
                var reviews = await _userService.GetReviewsByCoordinates(location.Latitude, location.Longitude);
                if (reviews != null && reviews.Any())
                {
                    location.Reviews = reviews;
                    location.AverageRating = reviews.Average(r => r.Rating);
                }

                // Check if weather data needs updating
                if (DateTime.Now.Subtract(_lastUpdated).TotalHours >= 1)
                {
                    location.Weather = await _weatherService.FetchWeatherDataAsync(location.Latitude, location.Longitude, ApiKey);
                    isWeatherDataUpdated = true;

                    if (location.Weather != null)
                    {
                        location.SkydivingScore = _locationService.CalculateSkydivingScore(location.Weather);
                    }
                }
                else
                {
                    // Use cached weather data
                    var cachedLocation = _cachedLocations.FirstOrDefault(l => l.Latitude == location.Latitude && l.Longitude == location.Longitude);
                    if (cachedLocation != null)
                    {
                        location.Weather = cachedLocation.Weather;
                        location.SkydivingScore = cachedLocation.SkydivingScore;
                    }
                }
            }

            // Update the static cache and the last updated timestamp if weather data is updated
            if (isWeatherDataUpdated)
            {
                _cachedLocations = skydivingLocations;
                _lastUpdated = DateTime.Now;
            }

            return skydivingLocations;
        }



        // POST: /users/authenticate
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] OAuthToken token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token.Token) as JwtSecurityToken;

            var oauthId = jsonToken?.Claims.FirstOrDefault(claim => claim.Type == "sub")?.Value;
            var firstName = jsonToken?.Claims.FirstOrDefault(claim => claim.Type == "given_name")?.Value;
            var lastName = jsonToken?.Claims.FirstOrDefault(claim => claim.Type == "family_name")?.Value;
            var email = jsonToken?.Claims.FirstOrDefault(claim => claim.Type == "email")?.Value;

            var user = await _userService.GetUserByUsernameAsync(email);

            if (user == null)
            {
                var newUser = new OAuthCredentials
                {
                    first_name = firstName,
                    last_name = lastName,
                    username = email
                };
                user = await _userService.CreateUserAsync(newUser);
            }

            return Ok(user);
        }

        [HttpPost("Review")]
        public async Task<IActionResult> AddReview([FromBody] ReviewModel reviewModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var review = new Review
            {
                Latitude = reviewModel.Latitude,
                Longitude = reviewModel.Longitude,
                Comment = reviewModel.Comment,
                Rating = reviewModel.Rating,
                //CreatedAt = DateTime.UtcNow // Assuming you want to set the creation time at the server side
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(review);
        }

        /*private List<SkydivingLocation> ReadSkydivingLocationsFromJson()
        {
            var jsonFilePath = "path_to_your_json_file.json"; // Update with the correct path
            var jsonData = System.IO.File.ReadAllText(jsonFilePath);
            return JsonConvert.DeserializeObject<List<SkydivingLocation>>(jsonData) ?? new List<SkydivingLocation>();
        }

        private async Task<WeatherData> FetchWeatherDataAsync(double latitude, double longitude)
        {

            var apiKey = "9a987c9434dd69ba9a0714016970da7e";
            var url = $"https://api.weatherstack.com/current?access_key={apiKey}&query={latitude},{longitude}&units=f";

            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();
            var weatherApiResponse = JsonConvert.DeserializeObject<WeatherApiResponse>(content);

            return new WeatherData
            {
                CloudCover = weatherApiResponse.Current.CloudCover,
                FeelsLike = weatherApiResponse.Current.FeelsLike,
                IsDay = weatherApiResponse.Current.IsDay,
                WindDegree = weatherApiResponse.Current.WindDegree,
                WindDirection = weatherApiResponse.Current.WindDirection,
                WindSpeed = weatherApiResponse.Current.WindSpeed
            };
        }*/


    }
}