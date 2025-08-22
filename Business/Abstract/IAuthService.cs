using Core.Utilities.Results;
using Core.Utilities.Security.JWT;
using Entities.Concrete;
using Entities.Dtos;
using Entities.DTOs;

public interface IAuthService
{
    Task<IDataResult<User>> Register(UserForRegisterDto userForRegisterDto, string password);
    Task<IDataResult<User>> Login(UserForLoginDto userForLoginDto);
    Task<IResult> UserExists(string email);
    Task<IDataResult<AccessToken>> CreateAccessToken(User user);
    Task<IDataResult<OtpTicket>> InitiateLogin(UserForLoginDto userForLoginDto);
    Task<IDataResult<AccessToken>> VerifyOtpAndCreateToken(OtpVerifyDto dto);
}