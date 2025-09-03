using AutoMapper;
using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using Entities.DTOs;
using System.Security.Claims;


namespace Business.Concrete
{
    public class CartManager : ICartService
    {
        ICartDal _cartDal;
        ICartItemDal _cartItemDal;
        IProductDal _productDal;
        IOrderDal _orderDal;
        IOrderDetailDal _orderDetailDal;
        IMapper _mapper;

        public CartManager
            (ICartDal cartDal, ICartItemDal cartItemDal,IProductDal productDal,
            IOrderDal orderDal,IOrderDetailDal orderDetailDal, IMapper mapper)
        {
            _cartDal = cartDal;
            _cartItemDal = cartItemDal;
            _productDal = productDal;
            _orderDal = orderDal;
            _orderDetailDal = orderDetailDal;
            _mapper = mapper;
        }

        //public async Task<IResult> AddToCartByUserId(int userId, int productId, int quantity)
        //{
        //    var cart = await _cartDal.Get(c => c.UserId == userId);
        //    if (cart == null)
        //    {
        //        return new ErrorResult(Messages.CartNotFound);
        //    }

        //    return await AddToCart(cart.Id, productId, quantity);
        //}

        //public async Task<IResult> AddToCartForUser(ClaimsPrincipal user, int productId, int quantity)
        //{
        //    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        //    if (userIdClaim == null)
        //        return new ErrorResult();

        //    int userId = int.Parse(userIdClaim.Value);

        //    var cart = await _cartDal.Get(c => c.UserId == userId);
        //    if (cart == null)
        //        return new ErrorResult();

        //    return await AddToCart(cart.Id, productId, quantity);
        //}


        //public async Task<IResult> AddToCart(int cartId, int productId, int quantity)
        //{
        //    var cart = await _cartDal.Get(c => c.Id == cartId);
        //    if (cart == null)
        //        return new ErrorResult("Cart not found");

        //    var product = await _productDal.Get(p => p.Id == productId);
        //    if (product == null)
        //        return new ErrorResult("Product not found");

        //    var existingItem = await _cartItemDal.Get(ci => ci.CartId == cartId && ci.ProductId == productId);
        //    int totalQuantityInCart = existingItem != null ? existingItem.Quantity + quantity : quantity;

        //    if (totalQuantityInCart > product.UnitsInStock)
        //        return new ErrorResult("Insufficient stock");

        //    if (existingItem != null)
        //    {
        //        existingItem.Quantity += quantity;
        //        await _cartItemDal.Update(existingItem);
        //    }
        //    else
        //    {
        //        var newItem = new CartItem
        //        {
        //            CartId = cartId,
        //            ProductId = productId,
        //            Quantity = quantity
        //        };
        //        await _cartItemDal.Add(newItem);
        //    }

        //    return new SuccessResult("Item added to cart");
        //}


        public async Task<IResult> AddToCart(int cartId, int productId, int quantity)
        {
            var cart = await _cartDal.Get(c => c.Id == cartId);
            if (cart == null)
            {
                return new ErrorResult(Messages.CartNotFound);
            }

            var product = await _productDal.Get(p => p.Id == productId);
            if (product == null)
            {
                return new ErrorResult(Messages.ProductNotFound);
            }

            var existingItem = await _cartItemDal.Get(ci => ci.CartId == cartId && ci.ProductId == productId);

            int totalQuantityInCart = existingItem != null ? existingItem.Quantity + quantity : quantity;

            if (totalQuantityInCart > product.UnitsInStock)
            {
                return new ErrorResult(Messages.InsufficientStock);
            }

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



        //public async Task<IDataResult<Cart>> GetCartById(int cartId)
        //{
        //    var cart = await _cartDal.Get(c => c.Id == cartId);
        //    if (cart == null)
        //    {
        //        return new ErrorDataResult<Cart>(Messages.CartNotFound);
        //    }
        //    return new SuccessDataResult<Cart>(cart, Messages.CartListed);
        //}


        //public async Task<IDataResult<CartDto>> GetCartById(int cartId)
        //{
        //    var cart = await _cartDal.GetCartByIdWithItems(cartId);
        //    if (cart == null)
        //        return new ErrorDataResult<CartDto>(Messages.CartNotFound);

        //    var cartDto = new CartDto
        //    {
        //        UserId = cart.UserId,
        //        CartItems = (from ci in cart.CartItems
        //                     join p in await _productDal.GetAll()
        //                         on ci.ProductId equals p.Id
        //                     select new CartItemDto
        //                     {
        //                         ProductName = p.Name,
        //                         Quantity = ci.Quantity,
        //                         UnitPrice = p.UnitPrice
        //                     }).ToList()
        //    };

        //    cartDto.TotalPrice = cartDto.CartItems.Sum(ci => ci.UnitPrice * ci.Quantity);

        //    return new SuccessDataResult<CartDto>(cartDto, Messages.CartListed);
        //}

        //public async Task<IDataResult<Cart>> GetCartById(int cartId)
        //{
        //    var cart = await _cartDal.GetCartByIdWithItems(cartId);
        //    if (cart == null)
        //    {
        //        return new ErrorDataResult<Cart>(Messages.CartNotFound);
        //    }
        //    return new SuccessDataResult<Cart>(cart, Messages.CartListed);
        //}

        public async Task<IDataResult<Cart>> GetCartById(int cartId)
        {
            var cart = await _cartDal.GetCartByIdWithItems(cartId);
            if (cart == null)
            {
                return new ErrorDataResult<Cart>(Messages.CartNotFound);
            }

            //navigation property ekle
            //var products = await _productDal.GetAll();

            //foreach (var item in cart.CartItems)
            //{
            //    var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            //    if (product != null)
            //    {
            //        item.Price = product.UnitPrice;
            //        item.ProductName = product.Name;
            //    }
            //}

            //cart.TotalPrice = cart.CartItems.Sum(ci => ci.Price * ci.Quantity);

            cart.TotalPrice = cart.CartItems.Sum(ci => ci.Quantity * ci.Product.UnitPrice);


            return new SuccessDataResult<Cart>(cart, Messages.CartListed);
        }




        public async Task<IResult> CreateCart(CartDto cartDto)
        {
            
            var existingCart = await _cartDal.Get(c => c.UserId == cartDto.UserId);
            if (existingCart != null)
            {
                return new ErrorResult(Messages.UserAlreadyHasCart);
            }

            
            var cartEntity = _mapper.Map<Cart>(cartDto);
            await _cartDal.Add(cartEntity);

            return new SuccessResult(Messages.CartCreated);
        }

        public async Task<IResult> CreateCart(int userId)
        {
            var existingCart = await _cartDal.Get(c => c.UserId == userId);
            if (existingCart != null)
            {
                return new ErrorResult(Messages.UserAlreadyHasCart);
            }
            var cartEntity = new Cart
            {
                UserId = userId
            };
            await _cartDal.Add(cartEntity);
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

        //public async Task<IDataResult<List<CartDto>>> GetAll()
        //{
        //    var CartEntity = await _cartDal.GetAllItems();
        //    var CartDto = _mapper.Map<List<CartDto>>(CartEntity);
        //    return new SuccessDataResult<List<CartDto>>(CartDto, Messages.CartsListed);
        //}

        public async Task<IDataResult<List<CartDto>>> GetAll()
        {
            var carts = await _cartDal.GetAllCartsWithItems();

            var products = await _productDal.GetAll();

            var cartDtos = carts.Select(c => new CartDto
            {
                UserId = c.UserId,
                CartItems = c.CartItems.Select(ci =>
                {
                    var product = products.FirstOrDefault(p => p.Id == ci.ProductId);
                    return new CartItemDto
                    {
                        ProductName = product?.Name,
                        Quantity = ci.Quantity,
                        UnitPrice = product?.UnitPrice ?? 0
                    };
                }).ToList()
            }).ToList();

            foreach (var cartDto in cartDtos)
            {
                cartDto.TotalPrice = cartDto.CartItems.Sum(ci => ci.UnitPrice * ci.Quantity);
            }

            return new SuccessDataResult<List<CartDto>>(cartDtos, Messages.CartsListed);
        }


        public async Task<IResult> Checkout(int cartId, int userId)
        {
            var cart = await _cartDal.Get(c => c.Id == cartId);
            if (cart == null)
            {
                return new ErrorResult(Messages.CartNotFound);
            }

            var cartItems = await _cartItemDal.GetAll(ci => ci.CartId == cartId);
            if (cartItems == null || !cartItems.Any())
            {
                return new ErrorResult(Messages.CartIsEmpty);
            }

            var order = new Order
            {
                UserId = userId,
                Date = DateTime.Now,
                OrderStatus = "Pending",
                TotalPrice = 0
            };

            await _orderDal.Add(order);

            foreach (var item in cartItems)
            {
                var product = await _productDal.Get(p => p.Id == item.ProductId);
                if (product == null)
                {
                    return new ErrorResult(Messages.ProductNotFound);
                }

                if (item.Quantity > product.UnitsInStock)
                {
                    return new ErrorResult(Messages.InsufficientStock);
                }

                var orderDetail = new OrderDetail
                {
                    OrderId = order.Id,                
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    Price = product.UnitPrice           
                };

                order.TotalPrice += orderDetail.Price * orderDetail.Quantity;

                await _orderDetailDal.Add(orderDetail);

                
                product.UnitsInStock -= item.Quantity;
                await _productDal.Update(product);
            }

            
            await _orderDal.Update(order);

            
            foreach (var item in cartItems)
            {
                await _cartItemDal.Delete(item);
            }

            return new SuccessResult(Messages.OrderCompleted);
        }
    }
}
