using Newtonsoft.Json;

namespace SkydiveAtlasAPI.Models
{
    public class WeatherApiResponse
    {
        public CurrentWeather Current { get; set; }
    }

    public class CurrentWeather
    {
        [JsonProperty("cloudcover")]
        public double CloudCover { get; set; }

        [JsonProperty("feelslike")]
        public double FeelsLike { get; set; }

        [JsonProperty("is_day")]
        public string? IsDay { get; set; }

        [JsonProperty("wind_degree")]
        public int WindDegree { get; set; }

        [JsonProperty("wind_dir")]
        public string? WindDirection { get; set; }

        [JsonProperty("wind_speed")]
        public double WindSpeed { get; set; }

        [JsonProperty("visibility")]
        public double Visibility { get; set; }
    }
}
