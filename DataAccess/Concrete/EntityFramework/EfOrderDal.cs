using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfOrderDal : EfEntityRepositoryBase<Order, Context>, IOrderDal
    {
        public async Task<List<Order>> GetAllItems()
        {
            using (var context = new Context())
            {
                return await context.Orders
                    .Include(c => c.OrderDetails)
                    .ToListAsync();
            }
        }

        public async Task<Order> GetOrderByIdWithItems(int orderId)
        {
            using (var context = new Context())
            {
                return await context.Orders
                                    .Include(c => c.OrderDetails)
                                    .FirstAsync(c => c.Id == orderId);
            }
        }

        public async Task<List<Order>> GetOrdersByUserId(int userId)
        {
            using (var context = new Context())
            {
                return await context.Orders
                                    .Include(c => c.OrderDetails)
                                    .ThenInclude(od => od.Product)
                                    .Where(c => c.UserId == userId)
                                    .ToListAsync();
            }
        }
    }
}
