using Newtonsoft.Json;
using SkydiveAtlasAPI.Models;

namespace SkydiveAtlasAPI
{
    public class WeatherDataService
    {
        public async Task<WeatherData?> FetchWeatherDataAsync(double latitude, double longitude, string apiKey)
        {
            var url = $"https://api.weatherstack.com/current?access_key={apiKey}&query={latitude},{longitude}&units=f";
            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            // Deserialize the response into WeatherApiResponse and map to WeatherData
            var weatherApiResponse = JsonConvert.DeserializeObject<WeatherApiResponse>(content);
            if (weatherApiResponse?.Current != null)
            {
                return new WeatherData
                {
                    CloudCover = weatherApiResponse.Current.CloudCover,
                    FeelsLike = weatherApiResponse.Current.FeelsLike,
                    IsDay = weatherApiResponse.Current.IsDay,
                    WindDegree = weatherApiResponse.Current.WindDegree,
                    WindDirection = weatherApiResponse.Current.WindDirection,
                    WindSpeed = weatherApiResponse.Current.WindSpeed,
                    Visibility = weatherApiResponse.Current.Visibility,
                };
            }

            return null; // or handle the case where the response is null or invalid
        }
    }
}
