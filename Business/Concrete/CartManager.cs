using AutoMapper;
using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;


namespace Business.Concrete
{
    public class CartManager : ICartService
    {
        ICartDal _cartDal;
        ICartItemDal _cartItemDal;
        IMapper _mapper;

        public CartManager(ICartDal cartDal, ICartItemDal cartItemDal, IMapper mapper)
        {
            _cartDal = cartDal;
            _cartItemDal = cartItemDal;
            _mapper = mapper;
        }


        public async Task<IResult> AddToCart(int cartId, int productId, int quantity)
        {
            var cart = await _cartDal.Get(c => c.Id == cartId);
            if (cart == null)
            {
                return new ErrorResult(Messages.CartNotFound);
            }

           
            var existingItem = await _cartItemDal.Get(ci => ci.CartId == cartId && ci.ProductId == productId);

            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                await _cartItemDal.Update(existingItem);
            }
            else
            {
                var newItem = new CartItem
                {
                    ProductId = productId,
                    Quantity = quantity,
                    CartId = cartId
                };
                await _cartItemDal.Add(newItem);
            }

            return new SuccessResult(Messages.ItemAddedToCart);
        }


        public async Task<IDataResult<Cart>> GetCartById(int cartId)
        {
            var cart = await _cartDal.Get(c => c.Id == cartId);
            if (cart == null)
            {
                return new ErrorDataResult<Cart>(Messages.CartNotFound);
            }
            return new SuccessDataResult<Cart>(cart, Messages.CartListed);
        }

    
        public async Task<IResult> CreateCart(Cart cart)
        {
            await _cartDal.Add(cart);
            return new SuccessResult(Messages.CartCreated);
        }

        public async Task<IResult> RemoveFromCart(int cartId, int productId)
        {
            var cart = await _cartDal.Get(c => c.Id == cartId);
            if (cart == null)
            {
                return new ErrorResult(Messages.CartNotFound);
            }

            var itemToRemove = await _cartItemDal.Get(ci => ci.CartId == cartId && ci.ProductId == productId);
            if (itemToRemove != null)
            {
                await _cartItemDal.Delete(itemToRemove);
                return new SuccessResult(Messages.ItemRemovedFromCart);
            }

            return new ErrorResult(Messages.ItemNotFoundInCart);
        }


        public async Task<IResult> DeleteCart(int cartId)
        {
            var cart = await _cartDal.Get(c => c.Id == cartId);
            await _cartDal.Delete(cart);
            return new SuccessResult(Messages.CartDeleted);
        }

        public async Task<IDataResult<List<CartDto>>> GetAll()
        {
            var CartEntity = await _cartDal.GetAllItems();
            var CartDto = _mapper.Map<List<CartDto>>(CartEntity);
            return new SuccessDataResult<List<CartDto>>(CartDto, Messages.CartsListed);
        }
    }
}
