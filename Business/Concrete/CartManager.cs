using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class CartManager : ICartService
    {
        ICartDal _cartDal;
        public CartManager(ICartDal cartDal)
        {
            _cartDal = cartDal;
        }

        public async Task<IResult> AddToCart(int cartId, int productId, int quantity)
        {
            var cart = await _cartDal.Get(c => c.Id == cartId);
            if (cart == null)
            {
                return new ErrorResult(Messages.CartNotFound);
            }
            var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
            }
            else
            {
                cart.CartItems.Add(new CartItem { ProductId = productId, Quantity = quantity });
            }
            await _cartDal.Update(cart);
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

        public async Task<IResult> CreateCart(int userId)
        {
            var newCart = new Cart { UserId = userId, CartItems = new List<CartItem>() };
            await _cartDal.Add(newCart);
            return new SuccessResult(Messages.CartCreated);
        }

        public async Task<IResult> RemoveFromCart(int cartId, int productId)
        {
            var cart = await _cartDal.Get(c => c.Id == cartId);
            if (cart == null)
            {
                return new ErrorResult(Messages.CartNotFound);
            }
            var itemToRemove = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
            if (itemToRemove != null)
            {
                cart.CartItems.Remove(itemToRemove);
                await _cartDal.Update(cart);
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

        public async Task<IDataResult<List<Cart>>> GetAll()
        {
            return new SuccessDataResult<List<Cart>>(await _cartDal.GetAll(), Messages.CartsListed);
        }
    }
}
