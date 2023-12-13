using Microsoft.Extensions.Logging;
using Moq;
using SkydiveAtlasAPI;
using SkydiveAtlasAPI.Controllers;
using SkydiveAtlasAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace SkyDiveAtlasXunit
{
    public class WeatherForecastControllerTests
    {
        private readonly Mock<SkydivingLocationService> _mockLocationService;
        private readonly Mock<IUserService> _mockUserService;
        private readonly Mock<WeatherDataService> _mockWeatherService;
        private readonly Mock<SkydiveAtlasContext> _mockContext;
        private readonly WeatherForecastController _controller;
        private readonly Mock<ILogger<WeatherForecastController>> _mockLogger;

        public WeatherForecastControllerTests()
        {
            _mockLocationService = new Mock<SkydivingLocationService>();
            _mockUserService = new Mock<IUserService>();
            _mockWeatherService = new Mock<WeatherDataService>();
            _mockContext = new Mock<SkydiveAtlasContext>();
            _mockLogger = new Mock<ILogger<WeatherForecastController>>();
            _controller = new WeatherForecastController(_mockLogger.Object, _mockLocationService.Object, _mockWeatherService.Object, _mockUserService.Object, _mockContext.Object);
        }

        [Fact]
        public async Task GetSkyDivingLocations_ReturnsLocationsWithUpdatedWeatherAndReviews()
        {
            // Arrange
            var fakeLocations = new List<SkydivingLocation>
            {
                new SkydivingLocation
                {
                    Name = "Skydive Awesome",
                    Latitude = 34.0522,
                    Longitude = -118.2437,
                    PhoneNumber = "123-456-7890",
                    Website = "https://skydiveawesome.com",
                    HoursOfOperation = new[] { "9 AM - 5 PM", "Closed on Sundays" },
                    Weather = new WeatherData
                    {
                        CloudCover = 10,
                        FeelsLike = 75,
                        IsDay = "yes",
                        WindDegree = 180,
                        WindDirection = "S",
                        WindSpeed = 5,
                        Visibility = 10
                    },
                    SkydivingScore = 8,
                    Reviews = new List<Review>
                    {
                        new Review { Rating = 5, Comment = "Amazing experience!", Latitude = 34.0522, Longitude = -118.2437, Id = 1 }
                    },
                    AverageRating = 5
                },
                // Add more SkydivingLocation instances as needed
            };
            _mockLocationService.Setup(s => s.ReadSkydivingLocationsFromJson(It.IsAny<string>()))
            .Returns(fakeLocations);

            // Mock Reviews
            var fakeReviews = new List<Review>
            {
                new Review { Rating = 5, Comment = "Incredible jump!", Latitude = 34.0522, Longitude = -118.2437, Id = 2 },
                // Add more Review instances as needed
            };

            _mockUserService.Setup(s => s.GetReviewsByCoordinates(It.IsAny<double>(), It.IsAny<double>()))
                .ReturnsAsync(fakeReviews);

            // Mock Weather Data
            var fakeWeatherData = new WeatherData
            {
                CloudCover = 20,
                FeelsLike = 70,
                IsDay = "yes",
                WindDegree = 200,
                WindDirection = "SW",
                WindSpeed = 10,
                Visibility = 15
            };

            _mockWeatherService.Setup(s => s.FetchWeatherDataAsync(It.IsAny<double>(), It.IsAny<double>(), It.IsAny<string>()))
                .ReturnsAsync(fakeWeatherData);

            // Act
            var result = await _controller.GetSkyDivingLocations();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(fakeLocations.Count, result.Count());
            _mockUserService.Verify(s => s.GetReviewsByCoordinates(It.IsAny<double>(), It.IsAny<double>()), Times.AtLeastOnce);
            _mockWeatherService.Verify(s => s.FetchWeatherDataAsync(It.IsAny<double>(), It.IsAny<double>(), It.IsAny<string>()), Times.AtLeastOnce);
        }

        // Additional tests can be added here to cover more scenarios
    }
}
