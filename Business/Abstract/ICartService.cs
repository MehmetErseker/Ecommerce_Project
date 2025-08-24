using Core.Utilities.Results;
using Entities.Concrete;

namespace Business.Abstract
{
    public interface ICartService
    {
        Task<IDataResult<Cart>> GetCartById(int cartId);
        Task<IDataResult<List<CartDto>>> GetAll();
        Task<IResult> AddToCart(int cartId, int productId, int quantity);
        Task<IResult> RemoveFromCart(int cartId, int productId);
        Task<IResult> CreateCart(Cart cart);
        Task<IResult> DeleteCart(int cartId);
    }
}
