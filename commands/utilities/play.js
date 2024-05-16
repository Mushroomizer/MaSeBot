const {
  SlashCommandBuilder,
  VoiceBasedChannel,
  GuildMember,
} = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  StreamType,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  getVoiceConnection,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");

require("../../globals");

let player = null;
let playerSubscription = null;

function createPlayerAndPlay(connection, url) {
  player = createAudioPlayer();
  const stream = ytdl(url, { filter: "audioonly" });
  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
  });
  player.play(resource);
  playerSubscription = connection.subscribe(player);
  player.on(AudioPlayerStatus.Idle, () => {});
}

function connectToChannel(channel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
  return connection;
}
function play(connection, interaction){
  console.log(
    "The connection has entered the Ready state - ready to play audio!"
  );
  interaction.reply("Playing...");
  createPlayerAndPlay(connection, interaction.options.getString("url"));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song!")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The URL of the song to play")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      if (!interaction.isCommand() || !interaction.guildId) return;
      if (
        !(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel
      ) {
        await interaction.reply("You are not in a voice channel!");
        return;
      }
      let connection = null;
      // if (
      //   interaction.guild.members.me.voice.channelId ==
      //   interaction.member.voice.channelId
      // ) {
      //   console.log("I am already in the voice channel");
      //   connection = getVoiceConnection(interaction.guildId);
      // } else {
      //   connection = connectToChannel(interaction.member.voice.channel);
      // }
      connection = connectToChannel(interaction.member.voice.channel);
      if (
        connection.state.status == VoiceConnectionStatus.Ready &&
        player != null
      ) {
        player.stop();
        play(connection, interaction);
      }


      connection.on(VoiceConnectionStatus.Ready, () => {
       play(connection, interaction);
      });
    } catch (error) {
      await interaction.reply("Something went wrong: " + error);
    }
  },
};
