using Newtonsoft.Json;
using SkydiveAtlasAPI.Models;

namespace SkydiveAtlasAPI
{
    public class SkydivingLocationService
    {
        public List<SkydivingLocation> ReadSkydivingLocationsFromJson(string jsonFilePath)
        {
            var jsonData = File.ReadAllText(jsonFilePath);
            return JsonConvert.DeserializeObject<List<SkydivingLocation>>(jsonData) ?? new List<SkydivingLocation>();
        }

        public int CalculateSkydivingScore(WeatherData weather)
        {
            //if (weather.IsDay == "no") return 1; // Nighttime check

            int score = 10; // Start with a perfect score

            // Deduct points based on temperature
            score -= CalculateTemperaturePenalty(weather.FeelsLike);

            // Deduct points based on wind speed
            score -= CalculateWindPenalty(weather.WindSpeed);

            // Ensure score is not less than 1
            return Math.Max(score, 1);
        }

        private int CalculateTemperaturePenalty(double temperature)
        {
            const int idealMinTemp = 50;
            const int idealMaxTemp = 80;
            int penalty = 0;

            if (temperature < idealMinTemp)
            {
                penalty = (int)((idealMinTemp - temperature) / 5); // 1 point penalty for every 5 degrees below 50°F
            }
            else if (temperature > idealMaxTemp)
            {
                penalty = (int)((temperature - idealMaxTemp) / 5); // 1 point penalty for every 5 degrees above 80°F
            }

            return Math.Min(penalty, 5); // Max penalty capped at 5 points
        }


        private int CalculateWindPenalty(double windSpeed)
        {
            const int safeWindSpeed = 12;
            const int moderateRiskWindSpeed = 18;
            int penalty = 0;

            if (windSpeed > safeWindSpeed && windSpeed <= moderateRiskWindSpeed)
            {
                penalty = 2; // 2 points penalty for wind speed between 12-18 mph
            }
            else if (windSpeed > moderateRiskWindSpeed)
            {
                penalty = 4 + (int)((windSpeed - moderateRiskWindSpeed) / 5); // 4 points, plus 1 point for every 5 mph above 18 mph
            }

            return Math.Min(penalty, 10); // Max penalty capped at 10 points
        }


    }
}
