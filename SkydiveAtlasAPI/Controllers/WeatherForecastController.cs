using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SkydiveAtlasAPI.Models;
using System;
using System.Collections.Generic;
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

        private readonly ILogger<WeatherForecastController> _logger;

        private readonly SkydivingLocationService _locationService;
        private readonly WeatherDataService _weatherService;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, SkydivingLocationService locationService, WeatherDataService weatherService)
        {
            _logger = logger;
            _locationService = locationService;
            _weatherService = weatherService;
            if (_cachedLocations == null)
            {
                _cachedLocations = new List<SkydivingLocation>();
                _lastUpdated = DateTime.MinValue;
            }
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
            if (DateTime.Now.Subtract(_lastUpdated).TotalHours < 1)
            {
                // Return cached data if last update was less than an hour ago
                return _cachedLocations;
            }

            var skydivingLocations = _locationService.ReadSkydivingLocationsFromJson(_jsonFilePath);
            //var limitedLocations = skydivingLocations.Take(10).ToList();

            foreach (var location in skydivingLocations)
            {
                location.Weather = await _weatherService.FetchWeatherDataAsync(location.Latitude, location.Longitude, ApiKey);
            }

            // Update the static cache
            _cachedLocations = skydivingLocations;
            _lastUpdated = DateTime.Now;

            return skydivingLocations;
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