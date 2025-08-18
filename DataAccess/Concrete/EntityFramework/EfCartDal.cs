using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfCartDal : EfEntityRepositoryBase<Cart, Context>, ICartDal
    {
        public async Task<Cart> GetCartWithItems(int cartId)
        {
            using (var context = new Context())
            {
                return await context.Carts
                                    .Include(c => c.CartItems)
                                    .FirstOrDefaultAsync(c => c.Id == cartId);
            }
        }

        public async Task<List<Cart>> GetAllWithItems()
        {
            using (var context = new Context())
            {
                return await context.Carts
                                    .Include(c => c.CartItems)
                                    .ToListAsync();
            }
        }

    }
}
