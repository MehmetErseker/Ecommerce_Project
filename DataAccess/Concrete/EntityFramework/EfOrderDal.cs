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
        public async Task<Order> GetOrderByIdWithItems(int orderId)
        {
            using (var context = new Context())
            {
                return await context.Orders
                                    .Include(c => c.OrderDetails)
                                    .FirstAsync(c => c.Id == orderId);
            }
        }
    }
}
