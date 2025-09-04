using AutoMapper;
using Business.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        IOrderService _orderService;
        IMapper _mapper;
        public OrdersController(IOrderService orderService, IMapper mapper)
        {
            _orderService = orderService;
            _mapper = mapper;
        }

        [HttpGet("getall")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _orderService.GetAll();
            if (result.Success)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.Message);
        }

        [HttpGet("getbyid/{orderId}")]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            var result = await _orderService.GetById(orderId);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpGet("getbyuserid/{userId}")]
        public async Task<IActionResult> GetOrdersByUserId(int userId)
        {
            var result = await _orderService.GetOrdersByUserId(userId);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpDelete("delete/{orderId}")]
        public async Task<IActionResult> Delete(int orderId)
        {
            var result = await _orderService.Delete(orderId);
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }
    }
}
