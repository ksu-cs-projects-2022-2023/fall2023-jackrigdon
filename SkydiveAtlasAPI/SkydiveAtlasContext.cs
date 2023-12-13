using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.EntityFrameworkCore;
using SkydiveAtlasAPI.Models;
using System.Collections.Generic;

namespace SkydiveAtlasAPI
{


    public class SkydiveAtlasContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        //public DbSet<SkydivingLocation> SkydivingLocations { get; set; }
        // Uncomment the following line if you have a Reviews DbSet
        // public DbSet<Review> Reviews { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public SkydiveAtlasContext(DbContextOptions<SkydiveAtlasContext> options)
            : base(options)
        {
        }

        // If you still need the OnConfiguring method for fallback configuration, it can be kept like this:
        // However, ensure it does not conflict with the configuration provided in Program.cs
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlite("Data Source=C:\\Users\\jack.rigdon\\source\\repos\\fall2023-jackrigdon\\SkydiveAtlasAPI\\UserAndReviewInfo.db");
            }
        }

        
    }

    /*public class Review
    {
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }*/

}
