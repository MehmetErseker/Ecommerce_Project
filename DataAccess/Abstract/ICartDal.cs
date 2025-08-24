using Core.DataAccess;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Abstract
{
    public interface ICartDal: IEntityRepository<Cart>
    {
        Task<List<CartDto>> GetAllItems();
        //Task<List<Cart>> GetAllWithItems();
        //Task<Cart> GetCartWithItems(int cartId);
    }
}
