namespace Business.CSS
{
    public class ConsoleLogger : ILogger
    {
        public void Log()
        {
            Console.WriteLine("Console loglandı");
        }
    }
}
