let songList = [];
let Idx = 0;
let autoplay = false;

$(document).ready(async function () {
  $("#autoplay-switch").change(function () {
    autoplay = this.checked;
  });
  songList = await GetAllMusic()
    .then((res) => {
      return res;
    })
    .catch((error) => {
      console.log(error);
    });

  populateTable(songList);
  SetNewSong(songList[Idx].Artist, songList[Idx].Album, songList[Idx].Song);
  $(".song-row").eq(Idx).addClass("hl");

  // Add 'ended' event listener to the audio element
  $("audio").on("ended", function () {
    Idx++;
    if (Idx >= songList.length) {
      Idx = 0; // Loop back to the first song if the end of the list is reached
    }
    SetNewSong(songList[Idx].Artist, songList[Idx].Album, songList[Idx].Song);
    // Remove 'hl' class from all rows
    $(".song-row").removeClass("hl");

    // Add 'hl' class to the next row
    $(".song-row").eq(Idx).addClass("hl");
  });
});

function ArtistFilter() {
  let artistFilterValue = $("#artist-filter").val().toLowerCase();
  let albumFilterValue = $("#album-filter").val().toLowerCase();
  let songFilterValue = $("#song-filter").val().toLowerCase();

  let filteredSongList = songList.filter(
    (item) =>
      item.Artist.toLowerCase().includes(artistFilterValue) &&
      item.Album.toLowerCase().includes(albumFilterValue) &&
      item.Song.toLowerCase().includes(songFilterValue)
  );
  clearTable();
  populateTable(filteredSongList);
  Idx = -1;

  $("audio")
    .off("ended")
    .on("ended", function () {
      Idx++;
      if (Idx >= filteredSongList.length) {
        Idx = 0; // Loop back to the first song if the end of the list is reached
      }
      SetNewSong(
        filteredSongList[Idx].Artist,
        filteredSongList[Idx].Album,
        filteredSongList[Idx].Song
      );

      // Remove 'hl' class from all rows
      $(".song-row").removeClass("hl");

      // Add 'hl' class to the next row
      $(".song-row").eq(Idx).addClass("hl");
    });
}

function clearTable() {
  $("#tbody").empty();
}

function GetAllMusic() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/api/music/allmusic",
      type: "GET",
      dataType: "json",
      success: function (data) {
        var res = data.flatMap((artist) => {
          return artist.albums.flatMap((album) => {
            return album.songs.map((song) => {
              return {
                Artist: artist.artist,
                Album: album.album,
                Song: song,
              };
            });
          });
        });
        resolve(res);
      },
      error: function (error) {
        console.log("Error: ", error);
        reject(error);
      },
    });
  });
}

function populateTable(songList) {
  $.each(songList, function (i, item) {
    $("#tbody").append(
      `<tr onclick="Clicker(this, '${item.Artist.replace(
        /'/g,
        "\\'"
      )}', '${item.Album.replace(/'/g, "\\'")}', '${item.Song.replace(
        /'/g,
        "\\'"
      )}')"
      class="song-row"><th scope="row">${item.Artist}</th><td>${
        item.Album
      }</td><td>${item.Song.replace(".mp3", "").replace(/'/g, "\\'")}</td></tr>`
    );
  });
}
function Clicker(row, artist, album, song) {
  $(".hl").removeClass("hl");
  $(row).addClass("hl");
  SetNewSong(artist, album, song);
  Idx = $(row).index();
}

function SetNewSong(artist, album, song) {
  var songArg = song.replace(".mp3", "");
  $("#audioelement source").attr(
    "src",
    `/api/music/grabtrack?Artist=${artist}&Album=${album}&Song=${songArg}`
  );
  $("#audioelement")[0].load(); // This is necessary to update the audio element with the new source

  if (autoplay) {
    $("#audioelement")[0].play();
  }

  UpdateHeadings(artist, album, song);
}

function UpdateHeadings(artist, album, song) {
  $("#artist").html(`<p id="artist"><u>Artist</u>: ${artist}</p>`);
  $("#album").html(`<p id="album"><u>Album</u>: ${album}</p>`);
  $("#song").html(`<p id="song"><u>Song</u>: ${song}</p>`);
}
