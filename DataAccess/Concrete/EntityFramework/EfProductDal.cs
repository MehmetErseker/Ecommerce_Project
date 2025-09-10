using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfProductDal : EfEntityRepositoryBase<Product, Context>, IProductDal
    {
        public Task<List<ProductDetailDto>> GetProductDetails()
        {
            using (Context context = new Context()) 
            {
                var result = from p in context.Products
                             join c in context.Categories
                             on p.CategoryId equals c.Id
                             select new ProductDetailDto
                             {
                                 ProductId = p.Id,
                                 ProductName = p.Name,
                                 CategoryName = c.Name,
                                 UnitsInStock = p.UnitsInStock
                             };
                return result.ToListAsync();
            }
        }

        public async Task<List<ProductDto>> GetProductsWithCategoryName()
        {
            using (Context context = new Context())
            {
                var result = await (from p in context.Products
                                    join c in context.Categories
                                        on p.CategoryId equals c.Id
                                    select new ProductDto
                                    {
                                        Name = p.Name,
                                        CategoryId = c.Id,
                                        UnitPrice = p.UnitPrice,
                                        UnitsInStock = p.UnitsInStock
                                    }).ToListAsync();

                return result;
            }
        }

        public async Task<List<Product>> SearchByNameAsync(string search, int take = 50, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(search))
                return new List<Product>();

            var tokens = search.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            using var context = new Context();

            // MySQL 8: aksan/harf duyarsız eşleşme için genel amaçlı collation
            const string Collation = "utf8mb4_0900_ai_ci"; // alternatif: "utf8mb4_turkish_ci"

            // Collate’li alan + AND ile %token% filtreleri
            var q = context.Products
                .Select(p => new { Entity = p, NameCi = EF.Functions.Collate(p.Name, Collation) });

            foreach (var t in tokens)
            {
                var pattern = $"%{t}%";
                q = q.Where(x => EF.Functions.Like(x.NameCi, pattern));
            }

            var exact = search.Trim();

            var result = await q
                .OrderByDescending(x => x.NameCi == exact)                   // tam eşleşme önce
                .ThenByDescending(x => EF.Functions.Like(x.NameCi, exact + "%")) // başta geçenler
                .ThenBy(x => x.Entity.Name)                                  // alfabetik
                .Select(x => x.Entity)
                .Take(take)
                .ToListAsync(ct);

            return result;
        }
    }
}
