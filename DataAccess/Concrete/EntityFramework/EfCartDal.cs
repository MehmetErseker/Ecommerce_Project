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
        //public async Task<Cart> GetCartWithItems(int cartId)
        //{
        //    using (var context = new Context())
        //    {
        //        return await context.Carts
        //                            .Include(c => c.CartItems)
        //                            .FirstOrDefaultAsync(c => c.Id == cartId);
        //    }
        //}

        //public async Task<List<Cart>> GetAllWithItems()
        //{
        //    using (var context = new Context())
        //    {
        //        return await context.Carts
        //                            .Include(c => c.CartItems)
        //                            .ToListAsync();
        //    }
        //}

        //public async Task<List<CartDto>> GetAllItems()
        //{
        //    using (var context = new Context())
        //    {
        //        var result = await (from c in context.Carts
        //                            select new CartDto
        //                            {
        //                                UserId = c.Id,
        //                                CartItems = (from ci in c.CartItems
        //                                             join p in context.Products
        //                                                 on ci.ProductId equals p.Id
        //                                             select new CartItemDto
        //                                             {
        //                                                 ProductName = p.Name,
        //                                                 Quantity = ci.Quantity,
        //                                                 UnitPrice = p.UnitPrice
        //                                             }).ToList()
        //                            }).ToListAsync();

        //        return result;
        //    }
        //}

        public async Task<List<Cart>> GetAllCartsWithItems()
        {
            using (var context = new Context())
            {
                return await context.Carts
                                    .Include(c => c.CartItems)
                                    .ToListAsync();
            }
        }


        public async Task<Cart> GetCartByIdWithItems(int cartId)
        {
            using (var context = new Context())
            {
                return await context.Carts
                                    .Include(c => c.CartItems)
                                    .FirstOrDefaultAsync(c => c.Id == cartId);
            }
        }

    }
}
