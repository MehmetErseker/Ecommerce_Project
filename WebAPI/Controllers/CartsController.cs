using Business.Abstract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        ICartService _cartService;
        public CartsController(ICartService cartService)
        {
            _cartService = cartService;
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

        [HttpGet("getcartitems/{cartId}")]
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
        public async Task<IActionResult> CreateCart(int userId)
        {
            var result = await _cartService.CreateCart(userId);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpPost("addtocart/{cartId}/{productId}/{quantity}")]
        public async Task<IActionResult> AddToCart(int cartId, int productId, int quantity)
        {
            var result = await _cartService.AddToCart(cartId, productId, quantity);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpDelete("removefromcart/{cartId}/{productId}")]
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

    }
}
