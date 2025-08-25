using Core.DataAccess;
using DataAccess.Concrete.EntityFramework;
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
        Task<List<Cart>> GetAllCartsWithItems();
        Task<Cart> GetCartByIdWithItems(int cartId);
        //Task<List<CartDto>> GetAllItems();
        //Task<List<Cart>> GetAllWithItems();
        //Task<Cart> GetCartWithItems(int cartId);
    }
}
