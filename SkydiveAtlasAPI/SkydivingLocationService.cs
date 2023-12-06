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
    }
}
