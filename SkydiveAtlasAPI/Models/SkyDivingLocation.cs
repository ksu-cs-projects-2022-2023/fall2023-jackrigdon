using Newtonsoft.Json;

namespace SkydiveAtlasAPI.Models
{
    public class SkydivingLocation
    {
        [JsonProperty("Name")]
        public string? Name { get; set; }

        [JsonProperty("Latitude")]
        public double Latitude { get; set; }

        [JsonProperty("Longitude")]
        public double Longitude { get; set; }

        [JsonProperty("Phone Number")]
        public string? PhoneNumber { get; set; }

        [JsonProperty("Website")]
        public string? Website { get; set; }

        [JsonProperty("Hours of Operation")]
        public string[]? HoursOfOperation { get; set; }

        public WeatherData? Weather { get; set; }
    }

    public class WeatherData
    {
        public double CloudCover { get; set; }
        public double FeelsLike { get; set; }
        public string? IsDay { get; set; }
        public int WindDegree { get; set; }
        public string? WindDirection { get; set; }
        public double WindSpeed { get; set; }
        public double Visibility { get; set; }
    }


}
