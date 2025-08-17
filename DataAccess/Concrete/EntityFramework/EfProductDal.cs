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
    }
}
