using AutoMapper;
using Business.Abstract;
using Entities.Concrete;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        ICartService _cartService;
        IMapper _mapper;
        public CartsController(ICartService cartService, IMapper mapper)
        {
            _cartService = cartService;
            _mapper = mapper;
        }

        [HttpGet("getall")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _cartService.GetAll();
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpGet("getbyid/{cartId}")]
        public async Task<IActionResult> GetCartById(int cartId)
        {
            var result = await _cartService.GetCartById(cartId);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpPost("add")]
        public async Task<IActionResult> CreateCart(CartDto cartDto)
        {
            var result = await _cartService.CreateCart(cartDto);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpPost("addtocart")]
        public async Task<IActionResult> AddToCart(int cartId, int productId, int quantity)
        {
            var result = await _cartService.AddToCart(cartId, productId, quantity);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpDelete("removefromcart")]
        public async Task<IActionResult> RemoveFromCart(int cartId, int productId)
        {
            var result = await _cartService.RemoveFromCart(cartId, productId);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpDelete("delete/{cartId}")]
        public async Task<IActionResult> DeleteCart(int cartId)
        {
            var result = await _cartService.DeleteCart(cartId);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout(int cartId, int userId)
        {
            var result = await _cartService.Checkout(cartId, userId);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);

        }
    }
}
