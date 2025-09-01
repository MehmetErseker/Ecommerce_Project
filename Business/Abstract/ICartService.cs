using Core.Utilities.Results;
using Entities.Concrete;

namespace Business.Abstract
{
    public interface ICartService
    {
        Task<IResult> Checkout(int cartId, int userId);
        Task<IDataResult<CartDto>> GetCartById(int cartId);
        Task<IDataResult<List<CartDto>>> GetAll();
        Task<IResult> AddToCart(int cartId, int productId, int quantity);
        Task<IResult> RemoveFromCart(int cartId, int productId);
        Task<IResult> CreateCart(int userId);
        Task<IResult> DeleteCart(int cartId);
        //Task<IResult> CreateCartForUser(int userId);


    }
}
