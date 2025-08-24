using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfCategoryDal : EfEntityRepositoryBase<Category, Context>, ICategoryDal
    {
        public async Task<List<Category>> GetAllWithProducts()
        {
            using (Context context = new Context())
            {
                return await context.Categories
                                    .Include(c => c.Products)
                                    .ToListAsync();
            }
        }


    }
}
