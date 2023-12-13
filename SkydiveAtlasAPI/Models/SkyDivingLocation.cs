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

        public int SkydivingScore { get; set; }

        public List<Review> Reviews { get; set; } = new List<Review>();
        public double AverageRating { get; set; }
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
    public class Review
    {
        public int Rating { get; set; }
        public string? Comment { get; set; }
        //public DateTime CreatedAt { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int Id { get; set; }
    }

    public class ReviewModel
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Comment { get; set; }
        public int Rating { get; set; }
    }


}
